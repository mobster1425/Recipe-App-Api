const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ingredientSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  recipe: {
    type: Schema.Types.ObjectId,
    ref: 'Recipe'
  },
  createdby:{
    type:Schema.Types.ObjectId,
    ref:'User'
  }
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

module.exports = Ingredient;