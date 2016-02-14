const responses = {
  badRequest: function (data) {
    this.status(400);
    this.json(data);
  },

  forbidden: function(data) {
    this.status(403);
    this.json(data);
  },

  notFound: function(data) {
    this.status(404);
    this.json(data);
  },

  ok: function(data) {
    this.status(200);
    this.json(data);
  },

  created: function(data) {
    this.status(201);
    this.json(data);
  },

  serverError: function(data) {
    this.status(500);
    this.json(data);
  },

  unauthorized: function(data) {
    this.status(401);
    this.json(data);
  },

  updated: function() {
    this.status(204);
  }
};

export default responses;
