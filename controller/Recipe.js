const Recipe=require('../model/Recipe');
const {StatusCodes}=require('http-status-codes');
const {BadRequestError, NotFoundError} = require('../errors');
const mongoose=require('mongoose');
const Ingredient=require('../model/RecipeIngredient');
const User=require('../model/User');
const cloudinary = require('cloudinary').v2;
const fileUpload = require('express-fileupload');

const createRecipe = async (req, res) => {

  req.body.createdby=req.user.userId;
   const {unit}=req.body;
   console.log(unit);
  const { name, description,  instructions, ingredients,createdby } = req.body;
 // console.log(req.files);
   // const {computerimage}=req.files;
   //const {buffer}=req.files.image.data;
    
  
   //const result = await cloudinary.uploader.upload(buffer,{folder:'file-upload'});
    // Create the recipe
  
    

  const recipe = await Recipe.create({ name, description,  instructions,createdby });
  
  /*
   const recipe=new Recipe({
    name,
    description,
    instructions,
    createdby,
    image: result.secure_url,
  })
  */
 if(!Array.isArray(ingredients)){
  console.log('ingredients must be an array');
 }
    // Add the ingredients to the recipe
    for (const ingredient in ingredients) {
      const { name, quantity, unit } = ingredients[ingredient];
      console.log(name);
      console.log(quantity);
      console.log(unit);
      const newIngredient = await Ingredient.create({ name, quantity, unit });
      recipe.ingredients.push(newIngredient);
    }
    await recipe.save();
    
    res.status(StatusCodes.CREATED).json({ recipe });
  };

  const getrecipe=async(req,res)=>{

    const {
      user:{userId},
    params:{  id:recipeId}
    
    }=req;

    //const recipe=await Recipe.findOne({_id:recipeID}).populate('ingredients.ingredient');
    const recipe = await Recipe.findOne({_id: recipeId,createdby:userId}).populate({
        path:'ingredients',
        model:'Ingredient'
    });
      
    if(!recipe){

        throw new NotFoundError(`No recipe with id ${recipeId}`);
    }
    res.status(StatusCodes.OK).json({recipe});
  };


  const getallrecipe = async (req, res) => {
    const { search, sort } = req.query;
    const queryobject = {};
  
    if (search) {
      queryobject.name = { $regex: search, $options: 'i' };
    }
  
    let result = Recipe.find(queryobject).populate({
        path:'ingredients',
        model:'Ingredient'
    });
  
    if (sort === 'latest') {
      result = result.sort('-createdAt');
    }
  
    if (sort === 'oldest') {
      result = result.sort('createdAt');
    }
  
    if (sort === 'a-z') {
      result = result.sort('name');
    }
  
    if (sort === 'z-a') {
      result = result.sort('-name');
    }
  
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    result = result.skip(skip).limit(limit);
  
    const recipes = await result;
  
    const totalrecipes = await Recipe.countDocuments(queryobject);
    const numofpages = Math.ceil(totalrecipes / limit);
  
    res.status(StatusCodes.OK).json({ recipes, ingredients: recipes.ingredients, totalrecipes, numofpages });
  };



  const updateRecipe = async (req, res) => {
    const {
      body: { name, description, instructions, ingredients },
      user: { userId },
      params: { id: recipeId },
    } = req;
  
    try {
      const updatedRecipe = await Recipe.findByIdAndUpdate(
        { _id: recipeId, createdby: userId },
        req.body,
        { new: true, runValidators: true }
      ).populate({
        path: 'ingredients',
        model: 'Ingredient',
      });
  
      if (!updatedRecipe) {
        throw new NotFoundError(`Recipe with id ${recipeId} not found`);
      }
     // Updating image field if it exists in the request body
     /*
     if (req.files && req.files.image) {
      const { computerimage } = req.files;
      const cloudinaryRes = await cloudinary.uploader.upload(computerimage.tempFilePath);
      updatedRecipe.computerimage = cloudinaryRes.secure_url;
    }
    */


      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError(`User with id ${userId} not found`);
      }
  
      const index = user.recipe.indexOf(recipeId);
      if (index < 0) {
        throw new NotFoundError(`Recipe with id ${recipeId} not found in user's Recipe array`);
      }
  
      user.recipe[index] = updatedRecipe._id;
      user.markModified('Recipe');
      await user.save();
  
      res.status(StatusCodes.OK).json({ recipe: updatedRecipe });
    } catch (err) {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(err.message);
      } else {
        throw err;
      }
    }
  };
  
  const deleteRecipe = async (req, res) => {
    try {
        const {
            user: { userId },
            params: { id: recipeId }
        } = req;

        // Find the recipe and check if it exists
        const recipe = await Recipe.findById({_id:recipeId});
        if (!recipe) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Recipe not found' });
        }

        // Remove the recipe from the Recipe collection
        const result = await Recipe.deleteOne({ _id: recipeId });

        // Remove the recipe from the User collection
        const user = await User.findById({_id:userId});
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
        }
        const recipeIndex = user.recipe.indexOf({_id:recipeId});
        if (recipeIndex > -1) {
            user.recipe.splice(recipeIndex, 1);
            await user.save();
        }

        // Remove the recipe from any ingredients that reference it
        const ingredientIds = recipe.ingredients.map((i) => i.ingredient);
        await Ingredient.updateMany({ _id: { $in: ingredientIds } }, { $pull: { recipes: recipeId } });

        // Return success message or error message
        if (result.deletedCount === 1) {
            res.status(StatusCodes.OK).json({ message: 'Recipe deleted successfully' });
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Server error' });
        }
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Server error' });
    }
};
 
  
  module.exports={
    getallrecipe,
    getrecipe,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  }