import { ffDb } from "../src/storage/ffDb";

describe("formsflow database schema", () => {
  it("preserves primary keys while exposing the new scalar indexes", () => {
    expect(ffDb.verno).toBe(2);
    expect(ffDb.applications.schema.primKey.name).toBe("id");
    expect(ffDb.offlineSubmissions.schema.primKey.name).toBe("_id");
    expect(ffDb.formDefinitions.schema.primKey.name).toBe("_id");
    expect(ffDb.activeForm.schema.primKey.name).toBe("localDraftId");
    expect(ffDb.formProcesses.schema.primKey.name).toBe("formId");
    expect(ffDb.deletedDrafts.schema.primKey.name).toBe("serverDraftId");

    expect(ffDb.applications.schema.idxByName.serverDraftId).toBeDefined();
    expect(ffDb.offlineSubmissions.schema.idxByName.serverApplicationId).toBeDefined();
    expect(ffDb.formDefinitions.schema.idxByName.display).toBeDefined();
    expect(ffDb.formProcesses.schema.idxByName.processKey).toBeDefined();
    expect(ffDb.offlineSubmissions.schema.idxByName.data).toBeUndefined();
  });
});
