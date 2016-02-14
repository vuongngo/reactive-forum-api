import mongoose from 'mongoose';
let Schema = mongoose.Schema;

let topicSchema = new Schema({
  name: String,
  date: {type: Date, default: Date.now}
});

export default topicSchema;
