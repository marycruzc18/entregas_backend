import mongoose from 'mongoose';


const collection = 'carts';

const cartschema = new mongoose.Schema({
   
   
   
    products: {type:Array,  required: true}

})

const cartsModel = mongoose.model(collection,cartschema);

export default cartsModel;