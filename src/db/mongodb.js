import mongoose from 'mongoose'
import {config} from 'dotenv';

config();

export const mongoDb = () => {
 mongoose.connect(process.env.MONGO_CONNECTION_STRING,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
});

var db=mongoose.connection;

db.on('error',()=>{
    throw new Error('Something went Wrong in Database');
});

db.on('open',()=>{
    console.log('Database is Open');
});
}

