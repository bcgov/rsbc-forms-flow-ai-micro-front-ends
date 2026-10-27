import { RequestService, KeycloakService } from "@formsflow/service";
import {
  KEYCLOAK_CLIENT,
  KEYCLOAK_URL_AUTH,
  KEYCLOAK_URL_REALM,
  WEB_BASE_URL,
  FORMIO_URL,
  RSBC_API_URL,
} from "../endpoints/config";
import {
  OfflineDeleteService,
  OfflineFetchService
} from "../formsflow-rsbcservices";
import { OfflineSubmission } from "../storage/ffDb";
import PubSub from "pubsub-js";

class OfflineSubmissions {
  /**
   * Processes offline submissions by fetching them, processing drafts and submissions,
   * and deleting local submissions after the processes complete.
   * It returns the count of drafts and submissions processed.
   */
  public static async processOfflineSubmissions(): Promise<void> {
    try {
      // Access and JWT token refresh before processing the drafts and submissions
      await this.retryToken();
      await KeycloakService.getInstance(
        KEYCLOAK_URL_AUTH,
        KEYCLOAK_URL_REALM,
        KEYCLOAK_CLIENT
      ).updateJwtToken();
      
      const submissions =
        await OfflineFetchService.fetchAllNonActiveOfflineSubmissions();
      const processPromises = [
        this.processDrafts(submissions),
        this.processSubmission(submissions),
        this.processDraftDelete()
      ];

      // Wait for all processes to finish
      await Promise.all(processPromises);
      PubSub.publish("DRAFT_ENABLED_SYNC_COMPLETED", {
        status: "completed"
      });
    } catch (error) {
      // Log error and track failed drafts/submissions
      console.error("Error processing drafts or submissions:", error);

      // Publish the failure status with counts
      PubSub.publish("DRAFT_ENABLED_SYNC_COMPLETED", {
        status: "incompleted"
      });
    }
  }

  /**
   * Initializes Keycloak if it's not already initialized and retry token.
   */
  public static async retryToken(): Promise<void> {
    const instance = KeycloakService.getInstance(
      KEYCLOAK_URL_AUTH,
      KEYCLOAK_URL_REALM,
      KEYCLOAK_CLIENT
    );

    if (!instance.isInitialized) {
      await new Promise<void>((resolve) =>
        instance.initKeycloak((authenticated) => {
          if (!authenticated) {
            instance.retryTokenRefresh();
          }
          resolve();
        })
      );
    }
  }

  /**
   * Processes draft deletions. Fetches drafts marked for deletion and deletes them from both the server and local DB.
   */
  private static async processDraftDelete(): Promise<void> {
    const draftsToBeDeleted = await OfflineFetchService.fetchAllDraftDelete();
    const serverDraftIdList = draftsToBeDeleted.map(
      (draft) => draft.serverDraftId
    );

    await Promise.all(serverDraftIdList.map(this.deleteDrafts));
  }

  /**
   * Deletes a draft from the server and local database.
   * @param serverDraftId The ID of the draft to be deleted.
   */
  private static async deleteDrafts(serverDraftId: number): Promise<void> {
    const URL = `${WEB_BASE_URL}/draft/${serverDraftId}`;

    try {
      // Delete the draft from the server
      await RequestService.httpDELETERequest(URL);
      // Delete the corresponding local draft entry
      await OfflineDeleteService.deleteDraftDeleteWithServerId(serverDraftId);
    } catch (error) {
      console.error("Error deleting the draft:", error);
    }
  }

  /**
   * Processes drafts from the list of submissions.
   * - If the draft exists and has both a server draft ID and application ID, it will be updated.
   * - If the draft is new (no server IDs), it will be created.
   * @param submissions List of offline submissions to process.
   */
  private static async processDrafts(
    submissions: OfflineSubmission[]
  ): Promise<void> {
    const draftSubmissions = submissions.filter(
      (submission) => submission.type === "draft"
    );

    // Process each draft submission and update the count
    await Promise.all(
      draftSubmissions.map(async (draft) => {
        await this.handleDraftSubmission(draft);
      })
    );
  }

  /**
   * Handles the submission of drafts by checking if it needs to be created or updated.
   * @param draft The draft submission to be processed.
   */
  private static async handleDraftSubmission(
    draft: OfflineSubmission
  ): Promise<void> {
    try {
      if (
        draft.localDraftId &&
        draft.serverDraftId &&
        draft.serverApplicationId
      ) {
        // Update existing draft
        await this.prepareAndUpdateDraft(draft);
      } else if (
        draft.localDraftId &&
        !draft.serverDraftId &&
        !draft.serverApplicationId
      ) {
        // Create a new draft
        await this.prepareAndSubmitDraft(draft);
      }
    } catch (error) {
      console.error("Error handling the draft submission:", error);
    }
  }

  /**
   * Prepares and submits a new draft.
   * @param draft The draft submission to be created.
   */
  private static async prepareAndSubmitDraft(
    draft: OfflineSubmission
  ): Promise<void> {
    const url = `${WEB_BASE_URL}/draft`;
    const payload = { data: draft.data, formId: draft.formId };

    try {
      await RequestService.httpPOSTRequest(url, payload);
      await this.deleteLocalSubmissions(draft);
    } catch (error) {
      console.error("Error creating the submission:", error);
      throw new Error("Draft submission failed");
    }
  }

  /**
   * Prepares and updates an existing draft.
   * @param draft The draft submission to be updated.
   */
  private static async prepareAndUpdateDraft(
    draft: OfflineSubmission
  ): Promise<void> {
    const url = `${WEB_BASE_URL}/draft/${draft.serverDraftId}`;
    const payload = { data: draft.data, formId: draft.formId };

    try {
      await RequestService.httpPUTRequest(url, payload);
      await this.deleteLocalSubmissions(draft);
    } catch (error) {
      console.error("Error updating the submission:", error);
      throw new Error("Draft update failed");
    }
  }

  /**
   * Processes the submission of offline applications.
   * - If the application exists and has both server draft ID and application ID, it will be updated.
   * - If the application is new (no server IDs), it will be created.
   * @param submissions List of offline submissions to process.
   */
  private static async processSubmission(
    submissions: OfflineSubmission[]
  ): Promise<void> {
    const submittedData = submissions.filter(
      (submission) => submission.type === "application"
    );

    // Process each submission and update the count
    await Promise.all(
      submittedData.map(async (data) => {
        await this.handleSubmission(data);
      })
    );
  }

  /**
   * Handles the submission of an application, checking if it needs to be created or updated.
   * @param data The application submission to be processed.
   */
  private static async handleSubmission(
    data: OfflineSubmission
  ): Promise<void> {
    await this.prepareAndSubmitSubmission(data);
  }

  /**
   * Prepares and submits a new offline application to DF API.
   * @param data The application submission to be created.
   */
  private static async prepareAndSubmitSubmission(
    data: OfflineSubmission
  ): Promise<void> {
    try {
      const submissionData = data;
      const URL = `${RSBC_API_URL}/api/v1/offline_submission`;

      await RequestService.httpPOSTRequest(URL, submissionData);
      await this.deleteLocalSubmissions(data, true);
    } catch (error) {
      console.error("Error creating the submission:", error);
      throw new Error("Submission creation failed");
    }
  }

  /**
   * Deletes the local submission entry after processing.
   * @param submission The submission to be deleted.
   * @param deleteApplications Whether to delete the corresponding application as well.
   */
  private static async deleteLocalSubmissions(
    submission: OfflineSubmission,
    deleteApplications = false
  ): Promise<void> {
    await OfflineDeleteService.deleteOfflineSubmission(submission._id);

    if (deleteApplications) {
      await OfflineDeleteService.deleteApplicationWithLocalSubmissionId(
        submission.localSubmissionId
      );
    }
  }

  /**
   * Checks if there are any offline submissions available.
   * @returns True if there are offline submissions, false otherwise.
   */
  public static async anyOfflineSubmissions(): Promise<boolean> {
    try {
      return await OfflineFetchService.anyOfflineSubmissions();
    } catch (error) {
      console.error("Error checking offline submissions:", error);
      return false;
    }
  }
}

export default OfflineSubmissions;
