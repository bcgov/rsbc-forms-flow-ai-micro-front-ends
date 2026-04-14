/**
 * Mock for formsflow-rsbcservices
 *
 * Replaces the real module so OfflineFetchService returns empty data instead
 * of hitting IndexedDB (Dexie). All other exports are stubs.
 */
const OfflineFetchService = {
  fetchStaticDataFromTable: async (_tableName: string): Promise<any[]> => {
    return [];
  },
};

const OfflineSaveService = {};
const OfflineEditService = {};
const OfflineDeleteService = {};
const OfflineSubmissions = {};
const connectivityMonitor = {};

export {
  OfflineFetchService,
  OfflineSaveService,
  OfflineEditService,
  OfflineDeleteService,
  OfflineSubmissions,
  connectivityMonitor,
};
