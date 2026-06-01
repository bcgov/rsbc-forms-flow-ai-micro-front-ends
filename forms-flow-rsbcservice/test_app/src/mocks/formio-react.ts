/**
 * Mock for @aot-technologies/formio-react
 *
 * Provides a minimal ReactComponent base class so RSBCImage can be
 * instantiated without requiring a full formio.js runtime context.
 */
export class ReactComponent {
  component: any;
  options: any;
  data: any;
  builderMode: boolean = false;

  constructor(component: any, options: any, data: any) {
    this.component = component ?? {};
    this.options = options ?? {};
    this.data = data ?? {};
  }
}
