import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { mongoDb } from './src/db/mongodb.js';
import { adminRouter } from './src/routers/adminRouter.js';
import { deviceRouter } from './src/routers/deviceRouter.js';
import { userRouter } from './src/routers/userRouter.js';
mongoDb();

export const app: express.Application = express();

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(userRouter);
app.use(deviceRouter);
app.use(adminRouter);










