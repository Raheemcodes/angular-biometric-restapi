import base64url from 'base64url';
import { PubKeyCredRequest } from '../models/interface';
import { User } from '../models/users';

export const createPublickCredentials = (
  _id: string,
  username: string,
  challenge: string
): PublicKeyCredentialCreationOptions => {
  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions =
    {
      // Relying Party (a.k.a. - Service):
      rp: {
        name: 'ARAY',
      },

      // User:
      user: {
        id: <any>base64url(_id),
        name: username,
        displayName: username,
      },

      pubKeyCredParams: [
        {
          type: 'public-key',
          alg: -7,
        },
        {
          type: 'public-key',
          alg: -8,
        },
        {
          type: 'public-key',
          alg: -35,
        },
        {
          type: 'public-key',
          alg: -36,
        },
        {
          type: 'public-key',
          alg: -37,
        },
        {
          type: 'public-key',
          alg: -38,
        },
        {
          type: 'public-key',
          alg: -39,
        },
        {
          type: 'public-key',
          alg: -257,
        },
        {
          type: 'public-key',
          alg: -258,
        },
        {
          type: 'public-key',
          alg: -259,
        },
      ],

      attestation: 'direct',

      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
      },

      timeout: 60000,

      challenge: <any>challenge,
    };

  return publicKeyCredentialCreationOptions;
};

export const PubKeyCredOption = (user: any, challenge: string) => {
  const publicKeyCredentialGetOptions: PubKeyCredRequest = {
    challenge: base64url(
      <Buffer>Uint8Array.from(challenge, (c) => c.charCodeAt(0))
    ),

    allowCredentials: [
      {
        id: user!.webauthn.credentialID,
        type: 'public-key',
      },
    ],

    userVerification: 'preferred',

    timeout: 60000,
  };

  return publicKeyCredentialGetOptions;
};
