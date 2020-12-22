import express from 'express';




const app=express();

app.get('',(req,res)=>{
    console.log('hi')
});


app.listen(3000,()=>{
    console.log('app is listening')
})