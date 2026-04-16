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
  drivers_licence_jurisdiction: "BC",
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
};

/**
 * Default component settings passed to the RSBCImage constructor.
 *
 * - stage: "stageOne" | "stageTwo"
 * - rsbcImageSettings: JSON mapping that transforms form data keys before
 *   rendering. Set to null to pass the form data through unchanged.
 */
export const sampleComponentSettings: Record<string, any> = {
  stage: "stageOne",
  rsbcImageSettings: null,
};
