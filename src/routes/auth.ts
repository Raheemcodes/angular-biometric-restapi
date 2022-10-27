import express, { Router } from 'express';
import { body, check } from 'express-validator';
import {
  webauthnReg,
  webauthnRegVerification,
} from '../controllers/auth.registration';
import {
  webauthnLogin,
  webauthnLoginVerification,
} from '../controllers/auth.verification';
import { User } from '../models/users';

const router: Router = express.Router();

router.post(
  '/webauthn-reg',
  [
    check('username', 'INVALID_USERNAME')
      .trim()
      .isLength({ min: 3 })
      .isAlphanumeric()
      .custom(async (value, { req }) => {
        const user = await User.findOne({ name: value.toLowerCase() });
        if (user) throw new Error('USER_EXIST');

        return true;
      }),
  ],
  webauthnReg
);

router.post(
  '/webauthn-reg-verification',

  webauthnRegVerification
);

export const authRoutes = router;

router.post(
  '/webauthn-login',
  [
    body('username', 'INVALID_USERNAME')
      .trim()
      .isLength({ min: 3 })
      .isAlphanumeric()
      .custom(async (value, { req }) => {
        const user = await User.findOne({ name: value.toLowerCase() });
        if (!user) throw new Error('USER_NOT_FOUND');

        return true;
      }),
  ],
  webauthnLogin
);

router.post('/webauthn-login-verification', webauthnLoginVerification);
