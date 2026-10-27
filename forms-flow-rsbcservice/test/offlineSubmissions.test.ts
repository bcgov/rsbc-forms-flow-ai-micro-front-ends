import { RequestService } from "@formsflow/service";
import { OfflineDeleteService } from "../src/formsflow-rsbcservices";
import OfflineSubmissions from "../src/services/offlineSubmissions";
import { OfflineSubmission } from "../src/storage/ffDb";

jest.mock(
  "@formsflow/service",
  () => ({
    RequestService: {
      httpPUTRequest: jest.fn(),
    },
    KeycloakService: {
      getInstance: jest.fn(),
    },
  }),
  { virtual: true }
);

jest.mock("../src/formsflow-rsbcservices", () => ({
  OfflineDeleteService: {
    deleteOfflineSubmission: jest.fn(),
  },
  OfflineFetchService: {
    fetchAllDraftDelete: jest.fn(),
    fetchAllNonActiveOfflineSubmissions: jest.fn(),
  },
}));

const invokePrepareAndUpdateDraft = (draft: OfflineSubmission): Promise<void> =>
  Reflect.apply(
    Reflect.get(OfflineSubmissions, "prepareAndUpdateDraft"),
    OfflineSubmissions,
    [draft]
  ) as Promise<void>;

describe("OfflineSubmissions.prepareAndUpdateDraft", () => {
  const draft = {
    _id: "local-draft-1",
    formId: "form-1",
    data: { answer: "yes" },
    serverDraftId: 7,
    created: "2026-10-27T00:00:00.000Z",
    modified: "2026-10-27T00:00:00.000Z",
    type: "draft",
  } satisfies OfflineSubmission;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([400, 404])(
    "deletes the local draft without throwing for an Axios %s response",
    async (status) => {
      const error = Object.assign(new Error("Request failed"), {
        isAxiosError: true,
        response: { status },
      });
      jest.spyOn(RequestService, "httpPUTRequest").mockRejectedValue(error);

      await expect(invokePrepareAndUpdateDraft(draft)).resolves.toBeUndefined();

      expect(
        OfflineDeleteService.deleteOfflineSubmission
      ).toHaveBeenCalledTimes(1);
      expect(OfflineDeleteService.deleteOfflineSubmission).toHaveBeenCalledWith(
        draft._id
      );
    }
  );

  it("deletes the local draft after a successful update", async () => {
    jest.spyOn(RequestService, "httpPUTRequest").mockResolvedValue(undefined);

    await expect(invokePrepareAndUpdateDraft(draft)).resolves.toBeUndefined();

    expect(RequestService.httpPUTRequest).toHaveBeenCalledWith(
      expect.stringMatching(/\/draft\/7$/),
      { data: draft.data, formId: draft.formId }
    );
    expect(OfflineDeleteService.deleteOfflineSubmission).toHaveBeenCalledTimes(
      1
    );
    expect(OfflineDeleteService.deleteOfflineSubmission).toHaveBeenCalledWith(
      draft._id
    );
  });

  it.each([
    [
      "an Axios 500 response",
      Object.assign(new Error("Server error"), {
        isAxiosError: true,
        response: { status: 500 },
      }),
    ],
    ["a non-Axios error", new Error("Network failure")],
  ])("still throws for %s", async (_description, error) => {
    jest.spyOn(RequestService, "httpPUTRequest").mockRejectedValue(error);

    await expect(invokePrepareAndUpdateDraft(draft)).rejects.toThrow(
      "Draft update failed"
    );
    expect(OfflineDeleteService.deleteOfflineSubmission).not.toHaveBeenCalled();
  });
});
