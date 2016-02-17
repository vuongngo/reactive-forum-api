export function checkKeys(obj) {
  for (var prop in obj) {
    if (!obj[prop]) {
      return `${prop} is missing`;
    }
  }
};
