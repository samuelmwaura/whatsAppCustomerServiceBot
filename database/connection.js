const Sequelize = require('sequelize');
const sequelize= new Sequelize('kplcbot','Ace','Ace@2022',{dialect:'mysql',host:"127.0.0.1"});

module.exports= sequelize;