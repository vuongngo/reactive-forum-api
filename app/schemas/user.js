import mongoose from 'mongoose';
import profileSchema from './profile';
let Schema = mongoose.Schema;
import uniqueValidator from 'mongoose-unique-validator';

let userSchema = new Schema({
  username: {type: String, unique: true, required: true},
  hash: {type: String, required: true},
  salt: {type: String, required: true},
  token: String,
  profile: {type: profileSchema, default: profileSchema},
  userrole: String,
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now}
}); 

export default userSchema.plugin(uniqueValidator);
