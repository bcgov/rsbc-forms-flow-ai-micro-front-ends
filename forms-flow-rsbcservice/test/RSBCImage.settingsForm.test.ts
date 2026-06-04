jest.mock('@aot-technologies/formiojs/lib/components/_classes/component/Component.form', () =>
  jest.fn((tabs) => tabs)
);

import settingsForm from '../src/component/RSBCImage/RSBCImage.settingsForm';

describe('RSBCImage settings form', () => {
  test('includes RTS as an available printing stage option', () => {
    const tabs = settingsForm() as any[];
    const displayTab = tabs.find((tab) => tab.key === 'display');
    const stageSelect = displayTab.components.find((component) => component.key === 'stage');

    expect(stageSelect.data.values).toEqual(
      expect.arrayContaining([
        { label: 'Stage One', value: 'stageOne' },
        { label: 'Stage Two', value: 'stageTwo' },
        { label: 'RTS', value: 'rts' },
      ])
    );
    expect(stageSelect.defaultValue).toBe('stageOne');
  });
});
