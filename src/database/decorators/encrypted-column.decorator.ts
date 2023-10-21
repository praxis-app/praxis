import * as dotenv from 'dotenv';
import { Column } from 'typeorm';
import { EncryptionTransformer } from 'typeorm-encrypted';
import { ColumnCommonOptions } from 'typeorm/decorator/options/ColumnCommonOptions';
import { ColumnEnumOptions } from 'typeorm/decorator/options/ColumnEnumOptions';

dotenv.config();

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

export const EncryptedColumn = (
  options?: ColumnCommonOptions & ColumnEnumOptions,
) => {
  if (!process.env.DB_ENCRYPTION_KEY) {
    throw new Error('DB_ENCRYPTION_KEY is not defined');
  }
  const transformer = new EncryptionTransformer({
    key: process.env.DB_ENCRYPTION_KEY,
    algorithm: ENCRYPTION_ALGORITHM,
    ivLength: 16,
  });

  return Column({ transformer, ...options });
};
