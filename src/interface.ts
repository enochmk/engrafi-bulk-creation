export interface IEngrafiData {
  firstName: string;
  middleName: string;
  lastName: string;
  msisdn: string;
  iccid: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  docType: string;
  docNumber: string;
  region: string;
  city: string;
  address: string;
  action: string;
  alternateContactNumber: string;
  kinFirstName: string;
  userName: string;
  ismfsRequired: string;
  channel: string;
}

export interface ISimregDetails {
  MSISDN: string;
  DOCUMENT_ID: string;
  DOCUMENT_TYPE_ID: number;
  FIRST_NAME: string;
  LAST_NAME: string;
  DATE_OF_BIRTH: string;
  SUUID: string;
  BCAP: string;
  GENDER: string;
  NATIONALITY: string;
  ADDRESS: string;
  DIGITAL_ADDRESS: string;
  AGENT_ID: string;
}
