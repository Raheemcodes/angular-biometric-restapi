import base64url from 'base64url';
import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { Result, ValidationError, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { AuthResponseData } from '../models/interface';
import { User } from '../models/users';
import { handeleError, handleReqError } from '../util/error';
import { PubKeyCredOption } from '../util/util';
import { convertPublicKeyToPEM } from '../util/webauthn/convertPkToPem';
import { toHash } from '../util/webauthn/hashed';
import { verifySignature } from '../util/webauthn/verifySignature';

export const webauthnLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors: Result<ValidationError> = validationResult(req);
    const name: string = req.body.username.toLowerCase();

    if (!errors.isEmpty()) throw handleReqError(errors);

    const user = await User.findOne({ name });

    crypto.randomBytes(32, (err: Error | null, buf: Buffer) => {
      if (err) throw err;

      const challenge = buf.toString('hex');
      user!.webauthn!.challenge = challenge;
      user!.webauthn!.resetChallengeExpiration = new Date(Date.now() + 60000);
      user!.save();

      res.status(201).send(PubKeyCredOption(user, challenge));
    });
  } catch (err) {
    next(err);
  }
};

export const webauthnLoginVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const credential = req.body.credential;

    const decodedClientData = base64url.decode(
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

    const authDataBuffer: Buffer = base64url.toBuffer(
      credential.response.authenticatorData
    );
    const clientDataHash = toHash(
      base64url.toBuffer(credential.response.clientDataJSON)
    );

    const signatureBase = Buffer.concat([authDataBuffer, clientDataHash]);
    const publicKey = convertPublicKeyToPEM(
      base64url.toBuffer(user.webauthn!.credentialPublicKey!)
    );
    const signature = base64url.toBuffer(credential.response.signature);

    const sigVerified = verifySignature(signature, signatureBase, publicKey);

    if (!sigVerified) throw handeleError('INVALID_BIOMETRIC', 401);

    const token: string = jwt.sign(
      {
        name: user.name,
        id: user._id.toString(),
      },
      'somesuperraheemsecret',
      { expiresIn: '2h' }
    );

    const response: AuthResponseData = {
      name: user.name,
      id: user._id.toString(),
      token: token,
      expiresIn: 7200,
      message: 'Login Successful!',
    };

    res.status(201).send(response);
  } catch (err) {
    next(err);
  }
};
