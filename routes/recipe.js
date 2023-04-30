const express = require('express');

const router=express.Router();

const {
    getallrecipe,
    getrecipe,
    createRecipe,
    updateRecipe,
    deleteRecipe,

} = require('../controller/Recipe');
const {
    getRecipeIngredients,
    deleteRecipeIngredient
} =require('../controller/Ingredient');
//const {updateUser}=require('../controller/User');
const {createShoppingList}=require('../controller/Shoppinglist');
const {uploadRecipeImage,updateRecipeImage}=require('../controller/Imageupload')
router.route('/').post(createRecipe).get(getallrecipe);
router.route('/:id').get(getrecipe).delete(deleteRecipe).patch(updateRecipe);

router.route('/:id/ingredients').get(getRecipeIngredients);

router.route('/:id/ingredients/:otherid').delete(deleteRecipeIngredient);

router.route('/:id/shoppingList').get(createShoppingList);

router.route('/:id/uploadimage').post(uploadRecipeImage);
router.route('/:id/updateimage').patch(updateRecipeImage);

module.exports=router;