"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReqError = exports.handeleError = void 0;
const handeleError = (message, statusCode, data) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.data = data;
    return error;
};
exports.handeleError = handeleError;
const handleReqError = (errors) => {
    return (0, exports.handeleError)(errors.array()[0].msg, 422);
};
exports.handleReqError = handleReqError;
