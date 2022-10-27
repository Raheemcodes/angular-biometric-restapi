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
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_registration_1 = require("../controllers/auth.registration");
const auth_verification_1 = require("../controllers/auth.verification");
const users_1 = require("../models/users");
const router = express_1.default.Router();
router.post('/webauthn-reg', [
    (0, express_validator_1.check)('username', 'INVALID_USERNAME')
        .trim()
        .isLength({ min: 3 })
        .isAlphanumeric()
        .custom((value, { req }) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield users_1.User.findOne({ name: value.toLowerCase() });
        if (user)
            throw new Error('USER_EXIST');
        return true;
    })),
], auth_registration_1.webauthnReg);
router.post('/webauthn-reg-verification', auth_registration_1.webauthnRegVerification);
exports.authRoutes = router;
router.post('/webauthn-login', [
    (0, express_validator_1.body)('username', 'INVALID_USERNAME')
        .trim()
        .isLength({ min: 3 })
        .isAlphanumeric()
        .custom((value, { req }) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield users_1.User.findOne({ name: value.toLowerCase() });
        if (!user)
            throw new Error('USER_NOT_FOUND');
        return true;
    })),
], auth_verification_1.webauthnLogin);
router.post('/webauthn-login-verification', auth_verification_1.webauthnLoginVerification);
