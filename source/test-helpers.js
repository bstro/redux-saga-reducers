export function nextify(gen) {
  return {
    next(...args) {
      const { value, done } = gen.next(...args);
      gen.value = value;
      gen.done = done;
      return nextify(gen);
    },

    throw(...args) {
      const { value, done } = gen.throw(...args);
      gen.value = value;
      gen.done = done;
      return nextify(gen);
    },

    done() {
      return gen;
    }
  };
}