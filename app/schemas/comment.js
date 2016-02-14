import mongoose from 'mongoose';
//Children Schemas
import replySchema from './reply';

let Schema = mongoose.Schema;

let commentSchema = new Schema({
  _id: {type: Schema.Types.ObjectId, default: Schema.Types.ObjectId()},
  _user: {type: Schemas.Types.ObjectId, ref: 'User'},
  text: String,
  replies: [replySchema],
  likes: Number,
  likesIds: [{type: Schema.Types.ObjectId, ref: 'User'}],
  createdAt: {type: Date, default: Date.now},
  updatedAt: Date
});

export default commentSchema;
