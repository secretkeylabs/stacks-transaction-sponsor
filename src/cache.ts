import nodeCache from 'node-cache';
let cache = null;

export function start(done: (err?: unknown) => void) {
  if (cache) return done();

  cache = new nodeCache();
}

export function instance() {
  return cache;
}

export default {
  start,
  instance
};
