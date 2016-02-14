import mongoose from 'mongoose';
import topicSchema from '../schemas/topic';

topicSchema.statics.createTopics = function (names) {
  let topics = names.map(topic => {name: topic});
  return new Promise( (resolve, reject) => {
    this.create(topics, err, results => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    })
  });
};

topicSchema.statics.createTopic = function (topic) {
  return new Promise( (resolve, reject) => {
    this.create({name: topic}, (err, result) => {
      if (err) {
        reject(new Error(err));
      } else {
        resolve(result);
      }
    })
  })
}

let Topic = mongoose.model('Topic', topicSchema);
export default Topic;
