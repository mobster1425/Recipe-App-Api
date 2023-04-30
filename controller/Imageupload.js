const Recipe=require('../model/Recipe');
const {StatusCodes}=require('http-status-codes');
const {BadRequestError, NotFoundError} = require('../errors');
const mongoose=require('mongoose');

const User=require('../model/User');
const cloudinary = require('cloudinary').v2;
const fileUpload = require('express-fileupload');



const uploadRecipeImage = async (req, res) => {

    const {
        user:{userId},
      params:{  id:recipeId}
      
      }=req;
const {recipeimage}=req.files;
      const fileTypes=['image/jpeg','image/png','image/jpg'];
      const imageSize=1024 * 1024;
      console.log(recipeimage.mimetype);
      if (!fileTypes.includes(recipeimage.mimetype)) return res.send('Image formats supported : jpg,png,jpeg');
      if(recipeimage.size/1024>imageSize) return res.send(`image size should be less than ${imageSize}kb`);
      console.log(req.body);
      console.log(recipeimage.tempFilePath);
      


// Check if the recipe exists and belongs to the user
const recipe = await Recipe.findOne({ _id: recipeId, createdby: userId });
if (!recipe) {
  return res.status(404).json({ message: 'Recipe not found' });
}



    const result = await cloudinary.uploader.upload(
      recipeimage.tempFilePath,
      {
        
        folder: 'recipe-image',
      }
    );

    recipe.image=result.secure_url;

    await recipe.save();
    //fs.unlinkSync(req.files.image.tempFilePath);
    return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } });
  };

  const updateRecipeImage= async (req,res)=>{
    const {
      user:{userId},
    params:{  id:recipeId}
    
    }=req;

    const {recipeimage}=req.files;
      const fileTypes=['image/jpeg','image/png','image/jpg'];
      const imageSize=1024 * 1024;
      console.log(recipeimage.mimetype);
      if (!fileTypes.includes(recipeimage.mimetype)) return res.send('Image formats supported : jpg,png,jpeg');
      if(recipeimage.size/1024>imageSize) return res.send(`image size should be less than ${imageSize}kb`);
      console.log(req.body);
      console.log(recipeimage.tempFilePath);



      const result = await cloudinary.uploader.upload(
        recipeimage.tempFilePath,
        {
          
          folder: 'recipe-image',
        }
      );

    const recipe = await Recipe.findOneAndUpdate({ _id: recipeId, createdby: userId },
      {$set:{image:result.secure_url}},
      {new:true});
if (!recipe) {
  return res.status(404).json({ message: 'Recipe not found' });
}




return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } });






  }
  
  module.exports = {
    uploadRecipeImage,
    updateRecipeImage,
  };
