import mongoose from 'mongoose';
//Children Schemas
import replySchema from './reply';

let Schema = mongoose.Schema;

let commentSchema = new Schema({
  _user: {type: Schema.Types.ObjectId, ref: 'User'},
  text: String,
  replies: {type: [replySchema], default: []},
  likes: Number,
  likeIds: [{type: Schema.Types.ObjectId, ref: 'User'}],
  createdAt: {type: Date, default: Date.now},
  updatedAt: Date
});

export default commentSchema;
