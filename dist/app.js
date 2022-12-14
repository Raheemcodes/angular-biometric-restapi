"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("./routes/auth");
const app = (0, express_1.default)();
const PORT = process.env.PORT;
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_DEFAULT_DATABASE = process.env.MONGO_DEFAULT_DATABASE;
const ACCESS_ORIGIN = process.env.ACCESS_ORIGIN;
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', ACCESS_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use(auth_1.authRoutes);
app.use((error, req, res, next) => {
    console.log(error);
    const { message, statusCode = 500, data } = error;
    res.status(statusCode).json({ message, data });
});
mongoose_1.default
    .connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@cluster0.u4041.mongodb.net/${MONGO_DEFAULT_DATABASE}`)
    .then(() => {
    console.log('Database connected succcessfully');
    app.listen(PORT || 5000, () => console.log('Server running!'));
})
    .catch((err) => {
    console.log(err);
});
