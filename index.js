require('dotenv').config();
require('express-async-errors');

// extra security packages
const helmet = require('helmet');
const xss = require('xss-clean');


const express = require('express');
const app = express();

const fileUpload = require('express-fileupload');
// USE V2
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



const authenticateUser = require('./middleware/auth');
const mongoose = require('mongoose');

//const connectDB = require('./db/connect');
const authRouter = require('./routes/auth');
const recipeRouter=require('./routes/recipe');

//ERROR HANDLER

const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));

app.use(helmet());

app.use(xss());


//routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/recipe',authenticateUser,recipeRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
console.log(port);
/*
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
  */
  const url = process.env.MONGODB_URI

  console.log('connecting to', url)
  mongoose.connect(url)
    .then(result => {
      console.log('connected to MongoDB')
      console.log(port);
    })
    .catch((error) => {
      console.log('error connecting to MongoDB:', error.message)
    })

    app.listen(port,( )=>{
        console.log(`Server running on port ${port}`)
        } );

//start();