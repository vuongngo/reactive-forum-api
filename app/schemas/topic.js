import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
let Schema = mongoose.Schema;

let topicSchema = new Schema({
  name: {type: String, unique: true, require, required: true},
  date: {type: Date, default: Date.now}
});

export default topicSchema.plugin(uniqueValidator);
