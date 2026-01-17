import { RequestService } from "@formsflow/service";
import API from "../endpoints/index";
import { createRequestHeader } from "./requestHeaders";

export const updateUserLastActiveApi = async (
  userId: string,
  timeout: number,
  callback: any,
  errorHandler: any
) => {
  const url = `${API.GET_USER.replace("<user_id>", userId)}/update-last-active`;
  const headers = await createRequestHeader();
  RequestService.httpPOSTRequestWithTimeout(url, null, null, true, headers, timeout || 5000)
    .then((res: any) => {
      callback(res.data);
    })
    .catch((error: any) => {
      if (error?.response?.data) {
        errorHandler(error.response.data?.message);
      } else {
        errorHandler(`Failed to update last active for user with ${userId} userId!`);
      }
    });
};
