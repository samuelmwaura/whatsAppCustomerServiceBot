const express=require('express');
const Router=express.Router();
const controller= require('../controllers/Controller');

Router.get('/',controller.receiverFunction);
Router.post('/whatsapp',controller.handlerFunction);
Router.post('/status',controller.statusHandler);

module.exports=Router;
