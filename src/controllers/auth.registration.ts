import base64url from 'base64url';
import cbor from 'cbor';
import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { Result, ValidationError, validationResult } from 'express-validator';
import { PubCredential, Webauthn } from '../models/interface';
import { User } from '../models/users';
import { handeleError, handleReqError } from '../util/error';
import { createPublickCredentials } from '../util/util';

export const webauthnReg = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors: Result<ValidationError> = validationResult(req);
    const username: string = req.body.username.toLowerCase();

    if (!errors.isEmpty()) throw handleReqError(errors);

    crypto.randomBytes(32, async (err: Error | null, buf: Buffer) => {
      if (err) throw err;

      const challenge: string = buf.toString('hex');
      const webauthn: Webauthn = {
        challenge,
        resetChallengeExpiration: new Date(Date.now() + 60000),
      };
      const user = new User({ name: username, webauthn });
      const { _id } = await user.save();

      res
        .status(201)
        .send(createPublickCredentials(_id.toString(), username, challenge));
    });
  } catch (err) {
    next(err);
  }
};

export const webauthnRegVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors: Result<ValidationError> = validationResult(req);
    const credential: PubCredential = req.body.credential;

    if (!errors.isEmpty()) throw handleReqError(errors);

    const decodedClientData: string = base64url.decode(
      credential.response.clientDataJSON
    );
    const clientDataJSON = JSON.parse(decodedClientData);

    const user = await User.findOne({
      'webauthn.challenge': base64url.decode(clientDataJSON.challenge),
      'webauthn.resetChallengeExpiration': { $gt: Date.now() },
    });

    if (!user) throw handeleError('USER_NOT_FOUND', 404, 'User does not exist');

    if (
      clientDataJSON.type !== 'webauthn.create' &&
      clientDataJSON.origin !== process.env.FRONTEND_ADDRESS
    ) {
      throw handeleError(
        'INVALID_ORIGIN',
        401,
        'Invalid clientDataJSON origin'
      );
    }

    const attstObj = cbor.decodeFirstSync(
      base64url.toBuffer(credential.response.attestationObject)
    );

    const { authData } = attstObj;

    if (authData.byteLength < 37) {
      throw handeleError(
        'SHORT_AUTHDATA_BYTE',
        406,
        `Authenticator data was ${authData.byteLength} bytes, expected at least 37 bytes`
      );
    }

    let pointer: number = 53;

    const credIDLenBuf = authData.slice(pointer, (pointer += 2));
    const credIDLen = credIDLenBuf.readUInt16BE(0);
    const credentialID = base64url(
      authData.slice(pointer, (pointer += credIDLen))
    );
    const credentialPublicKey: string = base64url(authData.slice(pointer));

    user.webauthn!.credentialID = credentialID;
    user.webauthn!.credentialPublicKey = credentialPublicKey;

    user.save();

    res.status(201).send({ message: 'Biometric registration sucessful' });
  } catch (err) {
    next(err);
  }
};
