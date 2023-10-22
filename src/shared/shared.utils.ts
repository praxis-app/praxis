import { createHash, scryptSync } from 'crypto';

export const getHash = (value: string) => {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY not set');
  }
  const salt = createHash('sha256')
    .update(process.env.ENCRYPTION_KEY + value)
    .digest();
  const hash = scryptSync(value, salt, 64);

  return hash.toString('hex');
};
