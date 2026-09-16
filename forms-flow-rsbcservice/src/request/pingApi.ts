import { RequestService } from "@formsflow/service";
import API from "../endpoints/index";
import { createRequestHeader } from "./requestHeaders";

export const pingApi = async (
  callback: any,
  errorHandler: any,
  timeout?: number
) => {
  const url = API.PING;
  const headers = await createRequestHeader();
  RequestService.httpGETRequestWithTimeout(url, null, null, true, headers, timeout || 30000)
    .then((res: any) => {
      callback(res.data);
    })
    .catch((error: any) => {
      if (error?.response?.data) {
        errorHandler(error.response.data?.message);
      } else {
        errorHandler(`Failed to ping the API. Please check your network connection and try again.`);
      }
    });
};
