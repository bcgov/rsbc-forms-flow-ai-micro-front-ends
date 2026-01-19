import { RequestService } from "@formsflow/service";
import API from "../endpoints/index";
import { createRequestHeader } from "./requestHeaders";

export const fetchStaticData = async (
  resourceName: string,
  callback: any,
  errorHandler: any,
  timeout?: number
) => {
  const url = API.GET_STATIC_DATA.replace("<resource_name>", resourceName);
  const headers = await createRequestHeader();
  RequestService.httpGETRequestWithTimeout(url, null, null, true, headers, timeout || 30000)
    .then((res: any) => {
      if (res.data) {
        callback(res.data);
      } else {
        errorHandler(`No ${resourceName} data found!`);
      }
    })
    .catch((error: any) => {
      if (error?.response?.data) {
        errorHandler(error.response.data?.message);
      } else {
        errorHandler(`Failed to fetch ${resourceName} data!`);
      }
    });
};
