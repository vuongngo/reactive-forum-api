import mongoose from 'mongoose';
let Schema = mongoose.Schema;

let replySchema = new Schema({
  _user: {type: Schema.Types.ObjectId, ref: 'User'},
  text: String,
  likes: Number,
  likeIds: [{type: Schema.Types.ObjectId, ref: 'User'}],
  createdAt: {type: Date, default: Date.now},
  updatedAt: Date
});

export default replySchema;
