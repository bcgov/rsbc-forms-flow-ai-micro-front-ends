/**
 * Sample form data for testing RSBCImage.
 *
 * The top-level keys VI, TwentyFourHour, TwelveHour must be truthy for the
 * corresponding form sections to render. Set them to false to hide a section.
 */
export const sampleData: Record<string, any> = {
  // Form selection — controls which print layouts are rendered
  VI: false,
  TwentyFourHour: false,
  TwelveHour: false,
  IRP: true,

  form_version: "version2",

  // Form numbers
  VI_number: 1200001,
  TwentyFourHour_number: "24H2025",
  TwelveHour_number: "12H2025",
  IRP_number: "14500001",

  // Driver information
  driver_licence_no: "334324",
  drivers_licence_jurisdiction: {value: 'CA_BC', label: 'BRITISH COLUMBIA'},
  driver_last_name: "DOE",
  driver_given_name: "JOHN",
  driver_address: "1934 WESTPARK LN",
  driver_city: "VICTORIA",
  driver_prov_state: "BC",
  driver_postal: "V5K 2J1",
  driver_dob: "1985-06-15",
  driver_phone: "(250) 555-1234",
  driver_licence_class: "5",
  driver_licence_expiry: "2027-06-15",
  gender: "M",

  // Location information
  intersection_or_address_of_offence: "DOUGLAS ST & FORT ST",
  offence_city: "VICTORIA",
  offence_prov_state: "BC",

  // Vehicle information
  licencePlateNumber: "ABC-123",
  provinceState: "BC",
  vehicleYear: "2020",
  vehicleMakeAndModel: "TOYOTA CAMRY",
  vehicleColours: "BLK",
  vehicleIdentificationNumberVin1: "1HGBH41JXMN109186",

  // Officer / incident information
  "officer-lastname": "SMITH",
  "officer-prime-id": "VI3833",
  "officer-agency": "VICTORIA POLICE DEPARTMENT",
  peace_officer_name: "SMITH, OFFICER",
  agency_file_no: "VPD-2025-0001",
  date_of_driving: "2025-04-14",
  time_of_driving: "14:30",
  prohibitionType: "24hour",
  roadSafetyAct: true,
  confirmation_of_service_date: "2025-04-14",

  // Impound information
  vehicle_impounded: "NO",
  date_of_impound: "2025-04-14",

  // IRP-specific fields
  seized_DL: "NO",
  irp_impound_duration: "BACREFUSAL",
  time_suspicion_formed: "14:35",
  time_ASD_demand: "14:40",
  driver_refuse_breath_sample: "NO",
  time_breath_sample_refusal: "14:45",
  irp_reason_grounds: {
      witnessedByOfficer: true,
      admissionByDriver: true,
      independentWitness: true,
      other: true
  },
  "irp_asd_identification_1st_test": "alco-sensor",
  "irp_serial_1st_test": "test",
  "irp_time_1st_test": "09:12",
  "irp_result_shown_driver_1st_test": "NO",
  "irp_result_1st_test": "FAIL",
  "irp_right_2nd_test": "YES",
  "irp_right_different_asd": "YES",
  "irp_lower_test_prevail": "YES",
  "irp_driver_request_2nd_test": "YES",
  "irp_asd_identification_2nd_test": "alcotest-6000",
  "irp_serial_2nd_test": "3345777",
  "irp_time_2nd_test": "09:22",
  "irp_result_shown_driver_2nd_test": "NO",
  "irp_result_2nd_test": "WITHDRAWN", //WITHDRAWN
  "grounds_for_reasonable_suspicion": {
    "odorOnBreath": true,
    "admissionByDriver": true,
    "witnessedConsumption": true,
    "other": true
  },
  "last_drink": "test",
  "driver_continuously_observed": "NO",
};

/**
 * Default component settings passed to the RSBCImage constructor.
 *
 * - stage: "stageOne" | "stageTwo"
 * - rsbcImageSettings: JSON mapping that transforms form data keys before
 *   rendering. Set to null to pass the form data through unchanged.
 */
export const sampleComponentSettings: Record<string, any> = {
  stage: "rts",
  rsbcImageSettings: null,
};
