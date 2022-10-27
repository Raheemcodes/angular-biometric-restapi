import crypto from 'crypto';

export const verifySignature = (
  signature: Buffer,
  signatureBase: Buffer,
  publicKey: string,
  algo = 'sha256'
) => {
  return crypto
    .createVerify(algo)
    .update(signatureBase)
    .verify(publicKey, signature);
};
