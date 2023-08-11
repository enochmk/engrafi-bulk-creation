import { DataSource } from 'typeorm';

const host = '10.81.0.111';
const username = 'dmsuser';
const password = 'Nj8eBCm1sswR9vF6';
const dbName = 'BIOSIMREG2';

const datasource = new DataSource({
  type: 'mssql',
  username: username,
  password: password,
  database: dbName,
  host: host,
  options: {
    encrypt: false,
    trustServerCertificate: false,
  },
});

export const connectBiosimregDB = async () => {
  const result = await datasource.initialize();
  return result;
};

export default datasource;
