import API from "../endpoints/index";
import { createRequestHeader } from "./requestHeaders";
import { RequestService } from "@formsflow/service";

export const fetchFormStatistics = async (
  callback: any,
  errorHandler: any,
) => {
  const headers = await createRequestHeader();
  return await RequestService.httpGETRequest(API.FORM_STATISTICS, null, null, true, headers)
    .then((res: any) => {
      if (Array.isArray(res.data)) {
        callback(res.data);
      } else {
        errorHandler(`No form statistics found!`);
      }
    })
    .catch((error: any) => {
      if (error?.response?.data) {
        errorHandler(error.response.data?.message);
      } else {
        errorHandler(`Failed to fetch form statistics!`);
      }
    });
};