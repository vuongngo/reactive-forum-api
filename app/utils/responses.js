const responses = {
  badRequest: function (data) {
    this.status(400).json(data);
  },

  forbidden: function(data) {
    this.status(403).json(data);
  },

  notFound: function(data) {
    this.status(404).json(data);
  },

  ok: function(data) {
    this.status(200).json(data);
  },

  created: function(data) {
    this.status(201).json(data);
  },

  serverError: function(data) {
    this.status(500).json(data);
  },

  unauthorized: function(data) {
    this.status(401).json(data);
  },

  updated: function(data) {
    this.status(204).json(data);
  },

  removed: function(data) {
    this.status(202).json(data);
  }
};

export default responses;
