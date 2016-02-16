import mongoose from 'mongoose';
let Schema = mongoose.Schema;
import uniqueValidator from 'mongoose-unique-validator';

let topicSchema = new Schema({
  name: {type: String, unique: true, required: true},
  createdAt: {type: Date, default: Date.now}
});

export default topicSchema.plugin(uniqueValidator);
