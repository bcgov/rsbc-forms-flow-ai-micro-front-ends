/**
 * Mock for @aot-technologies/formiojs
 *
 * RSBCImage.settingsForm.ts imports baseEditForm which is only used to
 * configure the form.io builder UI — not needed for rendering or testing.
 */
const baseEditForm =
  (..._args: any[]) =>
  (): Record<string, any> => ({});

export default baseEditForm;
