import express, { Application, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { CustomError } from './models/interface';
import { authRoutes } from './routes/auth';

const app: Application = express();
const PORT = process.env.PORT;
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_DEFAULT_DATABASE = process.env.MONGO_DEFAULT_DATABASE;
const ACCESS_ORIGIN = <string>process.env.ACCESS_ORIGIN;

app.use(helmet());

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', ACCESS_ORIGIN);
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(authRoutes);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.log(error);
  const { message, statusCode = 500, data }: CustomError = error;

  res.status(statusCode).json({ message, data });
});

mongoose
  .connect(
    `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@cluster0.u4041.mongodb.net/${MONGO_DEFAULT_DATABASE}`
  )
  .then(() => {
    console.log('Database connected succcessfully');
    app.listen(PORT || 5000, () => console.log('Server running!'));
  })
  .catch((err) => {
    console.log(err);
  });
