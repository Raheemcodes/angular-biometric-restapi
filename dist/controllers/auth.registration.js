"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webauthnRegVerification = exports.webauthnReg = void 0;
const base64url_1 = __importDefault(require("base64url"));
const cbor_1 = __importDefault(require("cbor"));
const crypto_1 = __importDefault(require("crypto"));
const express_validator_1 = require("express-validator");
const users_1 = require("../models/users");
const error_1 = require("../util/error");
const util_1 = require("../util/util");
const webauthnReg = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        const username = req.body.username.toLowerCase();
        if (!errors.isEmpty())
            throw (0, error_1.handleReqError)(errors);
        crypto_1.default.randomBytes(32, (err, buf) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                throw err;
            const challenge = buf.toString('hex');
            const webauthn = {
                challenge,
                resetChallengeExpiration: new Date(Date.now() + 60000),
            };
            const user = new users_1.User({ name: username, webauthn });
            const { _id } = yield user.save();
            res
                .status(201)
                .send((0, util_1.createPublickCredentials)(_id.toString(), username, challenge));
        }));
    }
    catch (err) {
        next(err);
    }
});
exports.webauthnReg = webauthnReg;
const webauthnRegVerification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        const credential = req.body.credential;
        if (!errors.isEmpty())
            throw (0, error_1.handleReqError)(errors);
        const decodedClientData = base64url_1.default.decode(credential.response.clientDataJSON);
        const clientDataJSON = JSON.parse(decodedClientData);
        const user = yield users_1.User.findOne({
            'webauthn.challenge': base64url_1.default.decode(clientDataJSON.challenge),
            'webauthn.resetChallengeExpiration': { $gt: Date.now() },
        });
        if (!user)
            throw (0, error_1.handeleError)('USER_NOT_FOUND', 404, 'User does not exist');
        if (clientDataJSON.type !== 'webauthn.create' &&
            clientDataJSON.origin !== process.env.FRONTEND_ADDRESS) {
            throw (0, error_1.handeleError)('INVALID_ORIGIN', 401, 'Invalid clientDataJSON origin');
        }
        const attstObj = cbor_1.default.decodeFirstSync(base64url_1.default.toBuffer(credential.response.attestationObject));
        const { authData } = attstObj;
        if (authData.byteLength < 37) {
            throw (0, error_1.handeleError)('SHORT_AUTHDATA_BYTE', 406, `Authenticator data was ${authData.byteLength} bytes, expected at least 37 bytes`);
        }
        let pointer = 53;
        const credIDLenBuf = authData.slice(pointer, (pointer += 2));
        const credIDLen = credIDLenBuf.readUInt16BE(0);
        const credentialID = (0, base64url_1.default)(authData.slice(pointer, (pointer += credIDLen)));
        const credentialPublicKey = (0, base64url_1.default)(authData.slice(pointer));
        user.webauthn.credentialID = credentialID;
        user.webauthn.credentialPublicKey = credentialPublicKey;
        user.save();
        res.status(201).send({ message: 'Biometric registration sucessful' });
    }
    catch (err) {
        next(err);
    }
});
exports.webauthnRegVerification = webauthnRegVerification;
