import mongoose from 'mongoose';


const collection = 'messages';

const messageschema = new mongoose.Schema({
   
   
    user:{type:String, required: true},
    message:{type:String, required: true},
    timestamp: { type: Date, default: Date.now, index: true }
})

const messagesModel = mongoose.model(collection, messageschema);

export default messagesModel;