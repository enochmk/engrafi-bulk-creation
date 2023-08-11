import fs from 'fs';
import path from 'path';
import prisma, { connectDatabase } from './db';
import { getIccid, getSimRegDetails, isRegisteredOnEngrafi, registerEngrafi } from './helper';
import { IEngrafiData } from './interface';
import { connectBiosimregDB } from './biosimregdb';

const filePath = path.join(__dirname, 'data.txt');
const data = fs.readFileSync(filePath, 'utf8');

const main = async () => {
  const msisdns = data.split('\r\n');

  // connect to database
  await connectDatabase();
  await connectBiosimregDB();

  let counter = 0;
  const total = msisdns.length;
  for (const msisdn of msisdns) {
    counter++;
    console.log(`Processing ${counter} of ${total}: ${msisdn}`);

    // check if msisdn is already processed
    const existingEngrafi = await prisma.engrafi.findFirst({
      where: {
        msisdn,
      },
    });

    if (existingEngrafi) {
      console.log(`${counter}: Already processed: ${msisdn}`);
      continue;
    }

    // process msisdn
    await processPhoneNumber(msisdn);
  }
};

const processPhoneNumber = async (msisdn: string) => {
  try {
    const isAlreadyRegistered = await isRegisteredOnEngrafi(msisdn);

    if (isAlreadyRegistered) {
      // save to database
      await prisma.engrafi.create({
        data: {
          msisdn,
          message: 'ALREADY REGISTERED',
          status: 'SUCCESS',
          response: null,
        },
      });
    }

    // get simreg details
    const details = await getSimRegDetails(msisdn);
    const iccid = await getIccid(msisdn);

    const engrafiData: IEngrafiData = {
      msisdn,
      iccid,
      firstName: details.FIRST_NAME,
      lastName: details.LAST_NAME,
      nationality: details.NATIONALITY,
      address: details.ADDRESS,
      alternateContactNumber: '',
      dateOfBirth: details.DATE_OF_BIRTH,
      docNumber: details.DOCUMENT_ID,
      docType: details.DOCUMENT_TYPE_ID ? 'NATIONAL_ID' : 'PASSPORT',
      gender: details.GENDER,
      action: 'REGISTER',
      channel: 'web',
      ismfsRequired: 'false',
      userName: details.AGENT_ID, //TODO: get the username
      middleName: '',
      city: 'N/A',
      kinFirstName: '',
      region: 'N/A',
    };

    // register engrafi
    const response = await registerEngrafi(engrafiData);

    // save to database
    await prisma.engrafi.create({
      data: {
        msisdn,
        message: response.message,
        status: 'SUCCESS',
        response: JSON.stringify(response),
      },
    });
  } catch (error: any) {
    await prisma.engrafi.create({
      data: {
        msisdn,
        message: error.message,
        status: 'ERROR',
      },
    });
  }
};

main();
