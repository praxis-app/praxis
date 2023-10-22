import { createHash, scrypt } from 'crypto';
import { promisify } from 'util';

export const scryptHash = async (value: string) => {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY not set');
  }
  const salt = createHash('sha256')
    .update(process.env.ENCRYPTION_KEY + value)
    .digest();

  const scryptPromise = promisify(scrypt);
  const hash = await scryptPromise(value, salt, 64);

  return (hash as Buffer).toString('hex');
};
