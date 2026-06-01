jest.mock('../src/assets/MV2634E_082023_driver.png', () => 'mock-24-driver.png');
jest.mock('../src/assets/MV2634E_082023_ilo.png', () => 'mock-24-ilo.png');
jest.mock('../src/assets/MV2634E_082023_icbc.png', () => 'mock-24-police.png');
jest.mock('../src/assets/MV2721_20250630.png', () => 'mock-vi-driver.png');
jest.mock('../src/assets/MV2722_20250630_Incident_Details.png', () => 'mock-vi-details.png');
jest.mock('../src/assets/MV2721_20250630_appeal.png', () => 'mock-appeal.png');
jest.mock('../src/assets/MV2722_20250630.png', () => 'mock-vi-report.png');
jest.mock('../src/assets/MV2906E_082023_driver.png', () => 'mock-12-driver.png');
jest.mock('../src/assets/MV2906E_082023_icbc.png', () => 'mock-12-police.png');
jest.mock('../src/assets/MV2634_012026_driver.png', () => 'mock-24v2-driver.png');
jest.mock('../src/assets/MV2634_012026_ilo.png', () => 'mock-24v2-ilo.png');
jest.mock('../src/assets/MV2634_012026_icbc.png', () => 'mock-24v2-police.png');
jest.mock('../src/assets/MV2723_0216.png', () => 'mock-irp.png');

import {
  formsPNGVersions,
  handleError,
  printCheckHelper,
  printFormatHelper,
} from '../src/helpers/helperServices';

describe('helperServices', () => {
  test('formsPNGVersions exposes both supported versions', () => {
    expect(Object.keys(formsPNGVersions)).toEqual(['version1', 'version2']);
    expect(formsPNGVersions.version1.stageOne.TwentyFourHour.DRIVER.png).toBe(
      'mock-24-driver.png'
    );
    expect(formsPNGVersions.version2.stageOne.IRP.DRIVER.png).toBe('mock-irp.png');
  });

  test('handleError logs prefixed error message', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    handleError('boom');

    expect(errorSpy).toHaveBeenCalledWith('Error:', 'boom');
    errorSpy.mockRestore();
  });

  test('printFormatHelper splits make and model values correctly', () => {
    const values = { vehicle_make_model: 'FORD F150' };

    const make = printFormatHelper(
      values,
      { field_name: 'vehicle_make_model' },
      'VEHICLE_MAKE',
      []
    );
    const model = printFormatHelper(
      values,
      { field_name: 'vehicle_make_model' },
      'VEHICLE_MODEL',
      []
    );

    expect(make).toBe('FORD');
    expect(model).toBe('F150');
  });

  test('printFormatHelper formats multi-field values and applies BC suffix', () => {
    const values = {
      city: { value: 'CITY_VICTORIA' },
      region: { value: 'REGION_ISLAND' },
    };

    const formatted = printFormatHelper(
      values,
      { field_name: ['city', 'region'] },
      'DL_SURRENDER_LOCATION',
      []
    );

    expect(formatted).toBe('VICTORIA, ISLAND, BC');
  });

  test('printFormatHelper prefers corporation_name for OWNER_NAME when owned_by_corp is true', () => {
    const values = {
      first_name: 'Jane',
      last_name: 'Doe',
      owned_by_corp: true,
      corporation_name: 'ACME LTD',
    };

    const formatted = printFormatHelper(
      values,
      { field_name: ['first_name', 'last_name'] },
      'OWNER_NAME',
      []
    );

    expect(formatted).toBe('ACME LTD');
  });

  test('printFormatHelper handles barcode and ISO date values', () => {
    const values = {
      ticket_no: 'AB123456',
      created_at: '2026-04-10T12:34:56Z',
    };

    const barcode = printFormatHelper(
      values,
      { field_name: 'ticket_no', barcode: true },
      'BARCODE_FIELD',
      []
    );
    const date = printFormatHelper(
      values,
      { field_name: 'created_at' },
      'DATE_FIELD',
      []
    );

    expect(barcode).toBe('*123456*');
    expect(date).toBe('2026-04-10');
  });

  test('printFormatHelper extracts location city label from object value', () => {
    const values = {
      location_city: { label: 'Vancouver', value: 'CITY_VANCOUVER' },
    };

    const city = printFormatHelper(
      values,
      { field_name: 'location_city' },
      'LOCATION_CITY',
      []
    );

    expect(city).toBe('Vancouver');
  });

  test('printFormatHelper maps release location vehicle to IMPOUNDED when VI is true', () => {
    const values = {
      VI: true,
      TwentyFourHour: false,
      TwelveHour: true,
      vehicle_location: 'released',
    };

    const location = printFormatHelper(
      values,
      { field_name: 'vehicle_location' },
      'RELEASE_LOCATION_VEHICLE',
      []
    );

    expect(location).toBe('IMPOUNDED');
  });

  test('printFormatHelper resolves release person and impound lot print name', () => {
    const values = {
      TwelveHour: true,
      VI: false,
      vehicle_location: 'private',
      'ILO-name': 'ABC Towing',
    };

    const impoundLotOperators = [
      { name: 'ABC Towing', name_print: 'ABC TOWING LTD.' },
    ];

    const releasePerson = printFormatHelper(
      values,
      { field_name: 'vehicle_location' },
      'RELEASE_PERSON',
      impoundLotOperators
    );
    const impoundLotName = printFormatHelper(
      values,
      { field_name: 'ILO-name' },
      'IMPOUND_LOT_NAME',
      impoundLotOperators
    );

    expect(releasePerson).toBe('ABC Towing');
    expect(impoundLotName).toBe('ABC TOWING LTD.');
  });

  test('printFormatHelper splits long incident details into report and details sections', () => {
    const longDetails = 'A'.repeat(700);
    const values = {
      incident_details: longDetails,
    };

    const reportPart = printFormatHelper(
      values,
      { field_name: 'incident_details' },
      'REPORT_INCIDENT_DETAILS',
      []
    );
    const detailsPart = printFormatHelper(
      values,
      { field_name: 'incident_details' },
      'DETAILS_INCIDENT_DETAILS',
      []
    );

    expect(reportPart.length).toBe(500);
    expect(detailsPart.length).toBe(200);
    expect(values.incident_details_explained_below).toBe(true);
  });

  test('printCheckHelper supports boolean inversion, arrays, and direct equality', () => {
    expect(
      printCheckHelper({ confirmed: true }, { field_name: 'confirmed', field_val: 'false' }, 'X')
    ).toBe(false);

    expect(
      printCheckHelper(
        { selected_reason: 'private' },
        { field_name: 'selected_reason', field_val: ['released', 'private'] },
        'X'
      )
    ).toBe(true);

    expect(
      printCheckHelper({ release_type: 'roadside' }, { field_name: 'release_type', field_val: 'roadside' }, 'X')
    ).toBe(true);
  });
});
