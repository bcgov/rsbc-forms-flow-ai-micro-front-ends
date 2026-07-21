import React from 'react';
import PrintServices from '../src/print/printService';
import { OfflineFetchService } from '../src/formsflow-rsbcservices';

jest.mock('../src/print/svgPrint', () => ({
  SVGprint: 'mock-svg-print',
}));

jest.mock('../src/formsflow-rsbcservices', () => ({
  OfflineFetchService: {
    fetchStaticDataFromTable: jest.fn(),
  },
}));

jest.mock('../src/helpers/helperServices', () => ({
  formsPNGVersions: {
    version1: {
      stageOne: {
        TwentyFourHour: {
          DRIVER: { png: '24-driver', aspectClass: '--landscape' },
          ILO: { png: '24-ilo', aspectClass: '--landscape' },
        },
        VI: {
          DRIVER: { png: 'vi-driver', aspectClass: '--portrait' },
          DETAILS: { png: 'vi-details', aspectClass: '--portrait' },
        },
        IRP: {
          DRIVER: { png: 'irp-driver', aspectClass: '--portrait' },
        },
      },
    },
    version2: {
      rts: {
        IRP: {
          RTS: { png: 'rts-front', aspectClass: '--portrait' },
          RTS_BACK: { png: 'rts-back', aspectClass: '--portrait' },
          POLICE: { png: 'irp-police', aspectClass: '--portrait' },
        },
      },
    },
  },
}));

describe('PrintServices', () => {
  const fetchStaticDataFromTableMock = OfflineFetchService.fetchStaticDataFromTable as jest.Mock;

  const getChildren = (rendered: any[]): any[] => {
    if (!rendered.length) {
      return [];
    }
    return React.Children.toArray(rendered[0].props.children) as any[];
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fetchStaticDataFromTableMock.mockResolvedValue([{ name: 'Lot 1' }]);
  });

  test('fetches impound lot operators and renders form components', async () => {
    const service = new PrintServices();
    const values = {
      TwentyFourHour: true,
      vehicle_impounded: 'YES',
      form_version: 'version1',
    };

    const rendered = await service.renderSVGForm(values, true, false, 'stageOne', false);

    expect(fetchStaticDataFromTableMock).toHaveBeenCalledWith('impoundLotOperators');
    expect(rendered).toHaveLength(1);
    expect(rendered[0].props.id).toBe('TwentyFourHour');

    const children = getChildren(rendered);
    expect(children).toHaveLength(2);
    expect(children[0].props.isPreview).toBe(true);
    expect(children[0].props.impoundLotOperators).toEqual([{ name: 'Lot 1' }]);
    expect(children[0].props.formVersion).toBe('version1');
  });

  test('transforms payload values for IRP and impounded vehicle rules', async () => {
    const service = new PrintServices();
    const values = {
      IRP: true,
      VI: false,
      vehicle_impounded: 'YES',
      date_released: '2026-01-01',
      time_released: '09:30',
      VI_number: '1234',
      driver_licence_no: 'D1234567',
      drivers_licence_jurisdiction: 'AB',
      form_version: 'version1',
    };

    const rendered = await service.renderSVGForm(values, false, false, 'stageOne', true);

    const children = getChildren(rendered);
    expect(children).toHaveLength(1);

    const transformedValues = children[0].props.values;
    expect(transformedValues.date_released).toBeNull();
    expect(transformedValues.time_released).toBeNull();
    expect(transformedValues.VI_number).toBeNull();
    expect(transformedValues.driver_licence_no_irp).toBeNull();
    expect(transformedValues.out_of_province_DL).toBe('D1234567');
    expect(children[0].props.isForSubmissionPayload).toBe(true);
  });

  test('skips ILO for TwentyFourHour when vehicle is not impounded', async () => {
    const service = new PrintServices();
    const values = {
      TwentyFourHour: true,
      vehicle_impounded: 'NO',
      form_version: 'version1',
    };

    const rendered = await service.renderSVGForm(values, false, false, 'stageOne', false);

    const children = getChildren(rendered);
    expect(children).toHaveLength(1);
    expect(children[0].props.formType).toBe('DRIVER');
  });

  test('skips DETAILS form when incident details are below threshold', async () => {
    const service = new PrintServices();
    const values = {
      VI: true,
      incident_details: 'a short detail',
      form_version: 'version1',
    };

    const rendered = await service.renderSVGForm(values, false, false, 'stageOne', false);

    const children = getChildren(rendered);
    expect(children).toHaveLength(1);
    expect(children[0].props.formType).toBe('DRIVER');
  });

  test('uses version1 as fallback when form_version is missing', async () => {
    const service = new PrintServices();
    const values = {
      TwentyFourHour: true,
      vehicle_impounded: 'YES',
    };

    const rendered = await service.renderSVGForm(values, false, false, 'stageOne', false);

    const children = getChildren(rendered);
    expect(children).toHaveLength(2);
    expect(children[0].props.formVersion).toBe('version1');
    expect(children[0].props.form).toBe('24-driver');
  });

  test('renders RTS stage IRP pages for version2 mappings', async () => {
    const service = new PrintServices();
    const values = {
      IRP: true,
      form_version: 'version2',
    };

    const rendered = await service.renderSVGForm(values, false, false, 'rts', false);

    expect(rendered).toHaveLength(1);
    expect(rendered[0].props.id).toBe('IRP');

    const children = getChildren(rendered);
    expect(children).toHaveLength(3);
    expect(children.map((child) => child.props.formType)).toEqual(['RTS', 'RTS_BACK', 'POLICE']);
    expect(children.map((child) => child.props.form)).toEqual(['rts-front', 'rts-back', 'irp-police']);
    expect(children.every((child) => child.props.renderStage === 'rts')).toBe(true);
  });
});
