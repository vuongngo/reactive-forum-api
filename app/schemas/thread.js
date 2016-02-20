import mongoose from 'mongoose';
var deepPopulate = require('mongoose-deep-populate')(mongoose);
//Children Schemas
import imgSchema from './img';
import commentSchema from './comment';

let Schema = mongoose.Schema;

let threadSchema = new Schema({
  _topic: {
    type: Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  _user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  cardImg: imgSchema,
  tags: {
    type: [String],
    default: []},
  comments: {type: [commentSchema], default: []},
  likes: Number,
  likeIds: [{type: Schema.Types.ObjectId, ref: 'User'}],
  createdAt: {type: Date, default: Date.now},
  updatedAt: Date
});

export default threadSchema.plugin(deepPopulate, {
  whitelist: [
    '_user',
    'comments._user',
    'comments.replies._user'
  ],
  populate: {
    '_user': {
      select: 'username profile'
    },
    'comments._user': {
      select: 'username profile'
    },
    'comments.replies._user': {
      select: 'username profile'
    }
  }
});

