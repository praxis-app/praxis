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
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not defined');
  }
  const transformer = new EncryptionTransformer({
    key: process.env.ENCRYPTION_KEY,
    algorithm: ENCRYPTION_ALGORITHM,
    ivLength: 16,
  });

  return Column({ transformer, ...options });
};
