import express from 'express';
import cors from 'cors';
import { userRouter } from './src/routers/userRouter.js';
import { mongoDb } from './src/db/mongodb.js';
import { deviceRouter } from './src/routers/deviceRouter.js';
import { adminRouter } from './src/routers/adminRouter.js';

mongoDb();

export const app = express();
app.get('/getname',async(req,res)=>{
    res.send('My Name');
})


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(userRouter);
app.use(deviceRouter);
app.use(adminRouter);










