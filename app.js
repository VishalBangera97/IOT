import express from 'express';
import cors from 'cors';

const app = express();

app.use(express.json());


var led = true;

app.post('/', (req, res) => {// Angular service will hit this api to toggle the led value console.log(led);
    console.log("api in");
    res.set('Content-Type', 'text/plain');
    res.send({ value: !led });
    led = !led;//every time we click the button value is toggled console.log("out");
    console.log(led);
})


app.get('/api', (req, res) => {// used to receive data from server
    // esp8266 will hit this api to get the led status 
    console.log(" esp in");// for testing purpose only 
    console.log(led);// log the value of led onto console 
    res.set('Content-Type', 'text/plain');// set the headers 
    if (led) {
        res.send({ value: 1 });// if led is on or true, send value=1    
    } else {
        res.send({ value: 0 });//else send value = 0    
    }
    console.log(led);
    console.log("out");// log the console.
})

//this tells the server to listen to request on port 3000
// and host can be either localhost or 192.168.43.161
const port=process.env.PORT || 3000;
app.use(cors(port));
app.listen(port, function () {
    console.log("Server running on localhost port : " + port);
})