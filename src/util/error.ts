import { Result, ValidationError } from 'express-validator';
import { CustomError } from '../models/interface';

export const handeleError = (
  message: string,
  statusCode?: number,
  data?: string
) => {
  const error: CustomError = new Error(message);
  error.statusCode = statusCode;
  error.data = data;
  return error;
};

export const handleReqError = (errors: Result<ValidationError>) => {
  return handeleError(errors.array()[0].msg, 422);
};
