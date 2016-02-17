import mongoose from 'mongoose';
import imgSchema from './img';
let Schema = mongoose.Schema;
import uniqueValidator from 'mongoose-unique-validator';

let profileSchema = new Schema({
  firstName: String,
  lastName: String,
  avatar: {imgSchema},
  posts: Number,
  comments: Number,
  replies: Number,
  total: Number,
  createdAt: {type: Date, default: Date.now}
});

export default profileSchema.plugin(uniqueValidator);
