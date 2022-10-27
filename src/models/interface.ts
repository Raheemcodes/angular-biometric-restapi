export interface Webauthn {
  challenge: string;
  resetChallengeExpiration: Date;
  credentialID?: string;
  credentialPublicKey?: string;
}

export interface UserInputData {
  userInput: {
    username: string;
    webauthn: Webauthn;
  };
}

export interface usernameData {
  username: string;
}

export interface CustomError {
  message: string;
  statusCode?: number;
  data?: any;
}

export interface PubCredential {
  readonly response: EncodedAuthAttestRes;
}

export interface EncodedAuthAttestRes {
  readonly clientDataJSON: string;
  readonly attestationObject: string;
}

export interface AuthResponseData {
  id: string;
  name: string;
  token: string;
  expiresIn: number;
  message: string;
}

export interface PubKeyCredRequest {
  allowCredentials?: {
    id: string | undefined;
    transports?: AuthenticatorTransport[];
    type: PublicKeyCredentialType;
  }[];
  challenge: string;
  extensions?: AuthenticationExtensionsClientInputs;
  rpId?: string;
  timeout?: number;
  userVerification?: UserVerificationRequirement;
}

export interface PubCredentialData {
  credential: PubCredential;
}

export interface AuthSuccess {
  message: string;
}
