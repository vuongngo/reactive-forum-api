import mongoose from 'mongoose';
//Children Schemas
import imgSchema from './img';
import commentSchema from './comment';

let Schema = mongoose.Schema;

let threadSchema = new Schema({
  _topic: {type: Schema.Types.ObjectId, ref: 'Topic'},
  owner: {type: Schema.Types.Objectid, ref: 'User'},
  title: String,
  description: Number,
  cardImg: imgSchema,
  tags: [String],
  comments: [commentSchema],
  likes: Number,
  likesIds: [{type: Schema.Types.ObjectId, ref: 'User'}],
  createdAt: {type: Date, default: Date.now},
  updatedAt: Date
});

export default threadSchema;
