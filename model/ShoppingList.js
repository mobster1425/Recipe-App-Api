const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shoppingListSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  ingredients: [{
    type: Schema.Types.ObjectId,
    ref: 'Ingredient'
  }],
  createdby:{
    type:Schema.Types.ObjectId,
    ref:'User'
  }
 
},
{timestamps:true}

);

const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);

module.exports = ShoppingList;