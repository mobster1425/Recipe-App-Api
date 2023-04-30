const Recipe=require('../model/Recipe');
const {StatusCodes}=require('http-status-codes');
const {BadRequestError, NotFoundError} = require('../errors');
const mongoose=require('mongoose');
const Ingredient=require('../model/RecipeIngredient');
const ShoppingList=require('../model/ShoppingList')

const createShoppingList = async (req, res) => {
  const {
    user:{userId},
  params:{  id:recipeId}
  
  }=req;


  try {
    const recipe = await Recipe.findById({_id:recipeId,createdby:userId}).populate({
      path: 'ingredients',
      model: 'Ingredient'
    });

    if (!recipe) {
      throw new NotFoundError(`No recipe with id ${recipeId}`);
    }

    const ingredientIds = recipe.ingredients.map(ingredient => ingredient._id);

    const shoppingList = new ShoppingList({
      name: recipe.name,
      ingredients: ingredientIds,
      createdby:userId
    });

    await shoppingList.save();
    const populatedShoppingList = await ShoppingList.findById(shoppingList._id).populate({
      path: 'ingredients',
      model: 'Ingredient',
      select: 'name quantity unit'
    });

    res.status(StatusCodes.CREATED).json({ shoppingList: populatedShoppingList });
    
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      throw new BadRequestError(error.message);
    }
    throw error;
  }
};


  module.exports = { createShoppingList };