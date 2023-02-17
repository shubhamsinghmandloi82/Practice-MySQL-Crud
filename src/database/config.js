const mysql = require('mysql');

 var connection=mysql.createConnection({
     host: process.env.HOST,
     user: process.env.USER,
     password: process.env.PASSWORD,
     database: process.env.DB,

 })
 connection.connect(err=>{
     if(err){
         console.log(err.message)
     }
     console.log("Database Connection Created Successfully")
 })

 module.exports=connection;