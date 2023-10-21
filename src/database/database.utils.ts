import { EncryptionTransformer } from 'typeorm-encrypted';
import * as dotenv from 'dotenv';

dotenv.config();

export const encryptColumn = () => {
  if (!process.env.DB_ENCRYPTION_KEY) {
    throw new Error('DB_ENCRYPTION_KEY is not defined');
  }
  return new EncryptionTransformer({
    key: process.env.DB_ENCRYPTION_KEY,
    algorithm: 'aes-256-gcm',
    ivLength: 16,
  });
};
