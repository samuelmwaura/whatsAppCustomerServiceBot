const Sequelize=require('sequelize');
const sequelize = require('../database/connection');

//USER SCHEMA
const customerSchema = {
   phone:{
       type:Sequelize.STRING(13),
       allowNull:false,
       primaryKey:true,
       unique:true
   },
   firstName:{
       type:Sequelize.STRING(20),
       allowNull:true
   }
}

//STAGES SCHEMA
const stageSchema = {
    id:{
        type:Sequelize.INTEGER(10),
        allowNull:false,
        primaryKey:true,
        autoIncrement:true,
        unique:true
    },
    stage:{
        type:Sequelize.STRING(20),
        allowNull:false,
        unique:true
    }
}

//CONVERSATION SCHEMA
const sessionSchema = {
    id:{
        type:Sequelize.INTEGER(10),
        allowNull:false,
        primaryKey:true,
        autoIncrement:true,
        unique:true
    },
    steps:{
        type:Sequelize.STRING(20),
        allowNull:false
    }
}

const customer = sequelize.define('customer',customerSchema,{timestamps:true});
const stage=sequelize.define('stage',stageSchema,{timestamps:true});
const session = sequelize.define('session',sessionSchema,{timestamps:true});
customer.hasOne(stage);
customer.hasMany(session)

module.exports={
    customer,
    stage,
    session
}