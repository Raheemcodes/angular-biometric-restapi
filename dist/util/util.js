"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubKeyCredOption = exports.createPublickCredentials = void 0;
const base64url_1 = __importDefault(require("base64url"));
const createPublickCredentials = (_id, username, challenge) => {
    const publicKeyCredentialCreationOptions = {
        // Relying Party (a.k.a. - Service):
        rp: {
            name: 'ARAY',
        },
        // User:
        user: {
            id: (0, base64url_1.default)(_id),
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
        challenge: challenge,
    };
    return publicKeyCredentialCreationOptions;
};
exports.createPublickCredentials = createPublickCredentials;
const PubKeyCredOption = (user, challenge) => {
    const publicKeyCredentialGetOptions = {
        challenge: (0, base64url_1.default)(Uint8Array.from(challenge, (c) => c.charCodeAt(0))),
        allowCredentials: [
            {
                id: user.webauthn.credentialID,
                type: 'public-key',
            },
        ],
        userVerification: 'preferred',
        timeout: 60000,
    };
    return publicKeyCredentialGetOptions;
};
exports.PubKeyCredOption = PubKeyCredOption;
