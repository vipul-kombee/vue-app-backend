const express = require('express');
const app = express();
app.use(express.json());

const mongoose = require('mongoose');

const UserRoutes = require('./Apis/User/user.route');
const ProductRoutes = require('./Apis/Product/product.route')

app.get("/health", (req, res, next) => {
    return res.status(200).json({
      message: "Health is good",
      date: new Date()
    });
  });
  
  //to handle CORS error( implemented by web browsers to prevent web pages from making requests to a different domain)
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
  });


  app.use('/user', UserRoutes);
  app.use('/product', ProductRoutes);

  mongoose.Promise = global.Promise;

//   mongodb+srv://niraveasternts:npn987654N@@cluster0.iexjg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
  mongoose.connect('mongodb+srv://niraveasternts:npn987654N@cluster0.iexjg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(() => {
       console.log("connect to DB");
  })
  .catch((e) => {
      console.log("not able to connect with DB");
      console.log(e);
  });
 
  module.exports = app;