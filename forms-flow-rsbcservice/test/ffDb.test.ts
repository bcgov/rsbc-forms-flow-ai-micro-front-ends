import Dexie from "dexie";

describe("formsflow database schema", () => {
  let ffDb: typeof import("../src/storage/ffDb").ffDb;

  beforeAll(async () => {
    const open = jest.spyOn(Dexie.prototype, "open").mockImplementation(function () {
      return Dexie.Promise.resolve(this);
    });
    const log = jest.spyOn(console, "log").mockImplementation(() => undefined);

    try {
      ({ ffDb } = await import("../src/storage/ffDb"));
    } finally {
      open.mockRestore();
      log.mockRestore();
    }
  });

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
    expect(ffDb.offlineSubmissions.schema.idxByName.created).toBeDefined();
    expect(ffDb.formDefinitions.schema.idxByName.title).toBeDefined();
    expect(ffDb.formProcesses.schema.idxByName.formName).toBeDefined();
    expect(ffDb.offlineSubmissions.schema.idxByName.data).toBeUndefined();
  });
});
