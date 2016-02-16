import mongoose from 'mongoose';
import Topic from '../../app/models/topic';

beforeEach(done => {
  mongoose.connect('localhost', 'test');
  Topic.remove({}, (err, res) => {
    done();
  })
});

afterEach(() => {
  mongoose.connection.close();  
});
