import _ from 'lodash';

export function batchQuery(req) {
  let query = req.query;
  let limit = req.query.limit || 10;
  let skip = (req.query.page  || 0) * 10;
  query = _.omit(query, ['limit', 'page', 'desc']);
  let dbQuery = _.mapValues(query, function(value) {
    let arr = value.split(':').map(e => e.trim());
    if (arr.length > 1) {
      const key = arr.shift();
      let obj = {};
      obj[`\$${key}`] = arr.join(':');
      return obj;
    } else {
      return value;
    }
  });
  return  {dbQuery: dbQuery, skip: skip, limit: limit};
};

export function getImg(req, field) {
  let imgParams = {meta: {}};
  if (req.files) {
    let img = req.files[field]; 
    if (img) {
      if (img.length > 0) {
        imgParams.url = img[0].path;
        imgParams.meta.type = img[0].mimetype;
        imgParams.meta.width = req.body.imgWidth || 500;
        imgParams.meta.height = req.body.imgHeight || 300;
      }
    }
  }
  return imgParams;
}

