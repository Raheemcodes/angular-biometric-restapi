"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySignature = void 0;
const crypto_1 = __importDefault(require("crypto"));
const verifySignature = (signature, signatureBase, publicKey, algo = 'sha256') => {
    return crypto_1.default
        .createVerify(algo)
        .update(signatureBase)
        .verify(publicKey, signature);
};
exports.verifySignature = verifySignature;
