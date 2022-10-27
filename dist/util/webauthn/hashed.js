"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHash = void 0;
const crypto_1 = __importDefault(require("crypto"));
const toHash = (data, algo = 'SHA256') => {
    return crypto_1.default.createHash(algo).update(data).digest();
};
exports.toHash = toHash;
