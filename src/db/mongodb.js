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
    console.log('Something went wrong');
});

db.on('open',()=>{
    console.log('Database is Open');
});
}

