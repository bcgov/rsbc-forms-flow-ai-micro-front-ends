// export all services here
import OfflineFetchService from "./storage/dbFetchServices";
import OfflineSaveService from "./storage/dbInsertServices";
import OfflineEditService from "./storage/dbUpdateServices";
import OfflineDeleteService from "./storage/dbDeleteServices";
import RSBCImage from "./component/RSBCImage/RSBCImage";
import BCMapSelector from "./component/BCMapSelector/BCMapSelector";
import OfflineSubmissions from "./services/offlineSubmissions";
import connectivityMonitor from "./services/connectivityMonitor";
import { FormStatistics } from "./component/FormStatistics/formStatistics";

export {
  OfflineFetchService,
  OfflineSaveService,
  OfflineEditService,
  OfflineDeleteService,
  RSBCImage,
  BCMapSelector,
  OfflineSubmissions,
  FormStatistics,
  connectivityMonitor
};
