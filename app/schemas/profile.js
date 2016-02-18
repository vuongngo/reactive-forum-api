import mongoose from 'mongoose';
import imgSchema from './img';
let Schema = mongoose.Schema;

let profileSchema = new Schema({
  firstName: String,
  lastName: String,
  avatar: imgSchema,
  posts: Number,
  comments: Number,
  replies: Number,
  total: Number,
  flags: [{type: Schema.Types.ObjectId, ref: 'Thread'}],
  createdAt: {type: Date, default: Date.now}
});

export default profileSchema;
