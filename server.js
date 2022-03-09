const express= require('express');
const morgan= require('morgan');
const dotenv= require('dotenv');
const request=require('request');
const sendingHandler=require('./sendingHandler');
const Router=require('./Routers/MessageRouters');
const sequelize=require('./database/connection');
const http= require('http');



//FIRING THE EXPRESS APP
const app= express();//firing the app
const  server= http.createServer(app);

// TO SORT OUT THE DATA ENCODING IN THE REQUESTS.
app.use(express.json({limit:'2mb'}));
app.use(express.urlencoded({extended:true}));


//CONNECTING THE DATABASE
sequelize.sync().then(()=>console.log('The database is on')).catch(err=>console.log(err))


//SERVER LOGS AND ENVIRONMENTAL VARIABLES
app.use(morgan('tiny'));//logging requests.
dotenv.config();//environmental variables
port=process.env.PORT;

//HANDLING THE REQUEST
 app.use(Router);


 
//MESSAGE SEND
//request.post(sendingHandler.options,sendingHandler.onResponseReceipt);    


// app.get('/',(req,res,)=>{
//     res.json({validation:'',done:'Group ${req.body.role} Updated Successfully.'});
// });

server.listen(port,()=>{
    console.log(`App attentive from ${port}`);

});