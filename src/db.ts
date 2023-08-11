import { PrismaClient } from '@prisma/client';

export interface Context {
  prisma: PrismaClient;
}

const prisma = new PrismaClient();

export const connectDatabase = async () => {
  try {
    console.log('Connecting to App database...');
    await prisma.$connect();
    console.log('Connected to App database');
  } catch (error: any) {
    console.log('Error connecting to App database', error);
    process.exit(1);
  }
};

export default prisma;
