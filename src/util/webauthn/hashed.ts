import crypto from 'crypto';

export const toHash = (data: Buffer | string, algo = 'SHA256') => {
  return crypto.createHash(algo).update(data).digest();
};
