import axios from 'axios';
import xml2js from 'xml2js';
import { IEngrafiData, ISimregDetails } from './interface';
import datasource from './biosimregdb';

export async function getIccid(msisdn: string): Promise<string> {
  const xmlBody = `
    <?xml version="1.0" encoding="ISO-8859-1"?>
    <Request>
      <SrvType>GET_NUMBER_DETAILS</SrvType>
      <AppName>solutions</AppName>
      <Username>SOLUTIONSTEAM</Username>
      <Password>SOLUTIONS@0715</Password>
      <ClientSessionId>1</ClientSessionId>
      <ClientTxnId>1</ClientTxnId>
      <MsgOrigin>solutions</MsgOrigin>
      <MsgDest>ECHELON</MsgDest>
      <Timestamp>05/06/2015 12:20:45</Timestamp>
      <Data>
        <Detail>
        <param>
            <name>NumberType</name>
            <value>3</value>
          </param>
          <param>
            <name>MSISDN</name>
            <value>${msisdn}</value>
          </param>
      </Detail>
      </Data>
    </Request>
    `.trim();

  const headerConfig = {
    headers: {
      'Content-Type': 'text/plain',
    },
  };

  // Send request
  const URL = `http://10.81.1.25:8081/Container/MoRouterRequestAdapter`;
  const response = await axios.post(URL, xmlBody, headerConfig);
  const cleanResponse = cleanXml(response.data);
  const jsonResponse = await xml2js.parseStringPromise(cleanResponse);

  // response code
  const resultCode = jsonResponse?.Response?.RespCode?.[0] as string;
  const resultDesc = (jsonResponse?.Response?.RespDesc?.[0] as string) || 'Unknown Error';

  // ! not successful
  const SUCCESS_CODE = 'SC0000';
  if (resultCode !== SUCCESS_CODE) {
    throw new Error(`${resultDesc} - ${msisdn}`);
  }

  // * successful
  const iccid = jsonResponse.Response?.Data[0]?.Detail[0]?.Param[0]?.RecordSet[0]?.Record[0]
    ?.Param[1]?.Value[0] as string;

  return iccid;
}

export async function registerEngrafi(data: IEngrafiData) {
  try {
    const URL = 'http://10.81.1.97:8000/mnp-registration';
    const response = await axios.post(URL, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
}

export async function getSimRegDetails(msisdn: string) {
  try {
    const sql = `SELECT A.DOCUMENT_ID, A.DOCUMENT_TYPE_ID, A.FIRST_NAME, A.LAST_NAME, A.ADDRESS, A.DIGITAL_ADDRESS, A.GENDER, A.NATIONALITY, B.AGENT_ID FROM MASTER_KYC A INNER JOIN MASTER_TRANSACTION B ON A.TRANSACTION_ID = B.TRANSACTION_ID WHERE B.MSISDN = '${msisdn}'`;
    const result = await datasource.query(sql);
    const details = result[0] as ISimregDetails;
    return details;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
}

export async function isRegisteredOnEngrafi(msisdn: string) {
  try {
    const URL = 'http://10.81.1.97:8000/get-customer-details';
    await axios.post(URL, { msisdn });
    return true;
  } catch (error: any) {
    return false;
  }
}

export const cleanXml = (value: string): string => {
  return value.replace(/&/g, '&amp;').replace(/-/g, '&#45;');
};
