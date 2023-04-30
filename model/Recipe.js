const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
   
  },
  image: {
    type: String,
   
  },
  instructions: [{
    type: String,
    required: true
  }],
  ingredients: [{
 type:Schema.Types.ObjectId,
 ref:'Ingredient'
  }],
  createdby:{
    type:Schema.Types.ObjectId,
    ref:'User'
  }
  
},
{strictPopulate:false},
{timestamps:true}
);
// Add a pre-hook to remove the recipe from any ingredients that reference it
recipeSchema.pre('remove', async function (next) {
    try {
      const ingredientIds = this.ingredients.map((i) => i.ingredient);
      await mongoose.model('Ingredient').updateMany(
        { _id: { $in: ingredientIds } },
        { $pull: { recipes: this._id } }
      );
      next();
    } catch (error) {
      next(error);
    }
  });



const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;