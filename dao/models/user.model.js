import mongoose from 'mongoose';
import cartsModel from './carts.model.js';

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique:true },
  age: { type: Number, required: true },
  password: { type: String, required: true },
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Carts' },
  role: {
    type: String,
    enum: ['user', 'admin', 'premium'], 
    default: 'user',
  },

});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
