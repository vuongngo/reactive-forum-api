import mongoose from 'mongoose';
let Schema = mongoose.Schema;

let metaSchema = new Schema({
  type: String,
  width: Number,
  heiht: Number
});

let imgSchema = new Schema({
  url: String,
  meta: metaSchema,
});

export default imgSchema;
