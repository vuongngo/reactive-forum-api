import Topic from '../models/topic';

export async function getTopic(req, res, next) {
  let id = req.params.id;
  try {
    let topic = await Topic.findOne(id).exec();
    res.ok({topic: topic});
  } catch (err) {
    next(err);
  }
};

export async function createTopic(req, res, next) {
  let name = req.body.name;
  if (!name) {
    res.badRequest('Topic name is missing');
  }
  try {
    let topic = await Topic.createTopic(name);
    res.created({topic: topic});
  } catch (err) {
    next(err.errors.name.message);
  }
};

export async function updateTopic(req, res, next) {
  let id = req.params.id;
  let name = req.body.name;
  if (!name) {
    res.badRequest('Topic name is missing');
  }
  try {
    let topic = await Topic.update({_id: id}, {$set: {name: name}});
    res.updated(topic);
  } catch (err) {
    next(err.message);
  }
};

export async function removeTopic(req, res, next) {
  let id = req.params.id;
  try {
    let topic = await Topic.remove({_id: id});
    res.removed();
  } catch(err) {
    next(err.message);
  }
};

export async function getTopics(req, res, next) {
  let limit = req.query.limit || 10;
  let last = req.query.last || new Date();
  try {
    let topics = await Topic.where('createdAt').lte(last).where('createdAt').sort('-1').limit(limit);
    res.ok({topics: topics});
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
