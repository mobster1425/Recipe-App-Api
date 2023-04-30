const Recipe=require('../model/Recipe');
const {StatusCodes}=require('http-status-codes');
const {BadRequestError, NotFoundError} = require('../errors');
const mongoose=require('mongoose');
const Ingredient=require('../model/RecipeIngredient');
const User = require('../model/User');

const getRecipeIngredients = async (req, res) => {
  try {
    const {
      user:{userId},
    params:{  id:recipeId}
    
    }=req;


    const recipe = await Recipe.findById({_id:recipeId,createdby:userId}).populate({
      path:'ingredients',
      model:'Ingredient'
    });

    if (!recipe) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Recipe not found' });
    }

    res.status(StatusCodes.OK).json({ ingredients: recipe.ingredients });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Server error' });
  }
};


const deleteRecipeIngredient = async (req, res) => {
  console.log(req.params);
  //const {recipeId,ingredientId}=req.params.id;
 // const recipeId=req.params.id;
 // const ingredientId=req.params.otherid;
//console.log(recipeId);
const {
  user:{userId},
params:{  id:recipeId,otherid:ingredientId},

}=req;

  try {
    // Find the recipe that contains the ingredient
    const recipe = await Recipe.findById({_id:recipeId,createdby:userId});

    if (!recipe) {
      throw new NotFoundError(`No recipe found with id ${recipeId}`);
    }

    // Find the index of the ingredient to remove
    const ingredientIndex = recipe.ingredients.findIndex(i => i._id.toString() === ingredientId);

    if (ingredientIndex === -1) {
      throw new NotFoundError(`No ingredient found with id ${ingredientId} for recipe ${recipeId}`);
    }

    // Remove the ingredient from the recipe's ingredients array
    recipe.ingredients.splice(ingredientIndex, 1);

    // Save the updated recipe
    await recipe.save();

    // Remove the recipeId from the ingredient's recipes array
    await Ingredient.updateOne({ _id: ingredientId }, { $pull: { recipes: recipeId } });

    // Delete the ingredient if it's not associated with any recipes
    await Ingredient.deleteOne({ _id: ingredientId, recipes: { $size: 0 } });

    res.status(StatusCodes.OK).json({ message: 'Recipe ingredient deleted successfully' });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      throw new BadRequestError(error.message);
    }
    throw error;
  }
};
  module.exports={
    getRecipeIngredients,
    deleteRecipeIngredient
    
  }

