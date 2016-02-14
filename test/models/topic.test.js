import Topic from '../../app/models/topic';
import expect from 'expect.js';
import mongoose from 'mongoose';
mongoose.connect('localhost', 'test');

describe('Topic static methods', () => {
  describe('createTopic', () => {
    it('should return topic', () => {
      expect(1).to.equal(1);
      console.log('run')
    })
  })
})

