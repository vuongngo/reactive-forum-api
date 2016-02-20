import mongoose from 'mongoose';
import topicSchema from '../schemas/topic';
import { promisify } from '../utils/async';

topicSchema.statics.createTopics = function (names) {
  let topics = names.map(topic => { return {name: topic} ;} );
  return promisify(this.create(topics));
};

topicSchema.statics.createTopic = function (topic) {
  return promisify(this.create({name: topic}));
}

let Topic = mongoose.model('Topic', topicSchema);
export default Topic;
