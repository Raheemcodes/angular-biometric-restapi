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
exports.webauthnLoginVerification = exports.webauthnLogin = void 0;
const base64url_1 = __importDefault(require("base64url"));
const crypto_1 = __importDefault(require("crypto"));
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_1 = require("../models/users");
const error_1 = require("../util/error");
const util_1 = require("../util/util");
const convertPkToPem_1 = require("../util/webauthn/convertPkToPem");
const hashed_1 = require("../util/webauthn/hashed");
const verifySignature_1 = require("../util/webauthn/verifySignature");
const webauthnLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        const name = req.body.username.toLowerCase();
        if (!errors.isEmpty())
            throw (0, error_1.handleReqError)(errors);
        crypto_1.default.randomBytes(32, (err, buf) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                throw err;
            const user = yield users_1.User.findOne({ name });
            const challenge = buf.toString('hex');
            user.webauthn.challenge = challenge;
            user.webauthn.resetChallengeExpiration = new Date(Date.now() + 60000);
            user.save();
            res.status(201).send((0, util_1.PubKeyCredOption)(user, challenge));
        }));
    }
    catch (err) {
        next(err);
    }
});
exports.webauthnLogin = webauthnLogin;
const webauthnLoginVerification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const credential = req.body.credential;
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
        const authDataBuffer = base64url_1.default.toBuffer(credential.response.authenticatorData);
        const clientDataHash = (0, hashed_1.toHash)(base64url_1.default.toBuffer(credential.response.clientDataJSON));
        const signatureBase = Buffer.concat([authDataBuffer, clientDataHash]);
        const publicKey = (0, convertPkToPem_1.convertPublicKeyToPEM)(base64url_1.default.toBuffer(user.webauthn.credentialPublicKey));
        const signature = base64url_1.default.toBuffer(credential.response.signature);
        const sigVerified = (0, verifySignature_1.verifySignature)(signature, signatureBase, publicKey);
        if (!sigVerified)
            throw (0, error_1.handeleError)('INVALID_BIOMETRIC', 401);
        const token = jsonwebtoken_1.default.sign({
            name: user.name,
            id: user._id.toString(),
        }, 'somesuperraheemsecret', { expiresIn: '2h' });
        const response = {
            name: user.name,
            id: user._id.toString(),
            token: token,
            expiresIn: 7200,
            message: 'Login Successful!',
        };
        res.status(201).send(response);
    }
    catch (err) {
        next(err);
    }
});
exports.webauthnLoginVerification = webauthnLoginVerification;
