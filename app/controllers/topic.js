import Topic from '../models/topic';

export async function createTopic(req, res, next) {
  let name = req.body.name;
  if (!name) {
    res.badRequest('Topic name is missing');
  }
  try {
    let topic = await Topic.createTopic(name);
    res.created({topic: topic});
  } catch (err) {
    next(err);
  }
};

export async function createTopics(req, res, next) {
  let names = req.body.names;
  if (!name) {
    res.badRequest('Topic names are missing');
  }
  try {
    let topics = await Topic.createTopics(names);
    res.created({topics: topics});
  } catch (err) {
    next(err);
  }
};
