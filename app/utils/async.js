export function wrap (fn) {
  return (...args) => fn(...args).catch(args[2]); 
}

export function promisify(fn) {
  return new Promise ( (resolve, reject) => {
    fn.then(res => resolve(res)).catch(err => reject(err));
  })
}
