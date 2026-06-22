function makeChainable(resolveValue) {
  resolveValue = resolveValue || [];
  const promise = Promise.resolve(resolveValue);
  const chain = {
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
  };
  chain.populate = jest.fn(() => makeChainable(resolveValue));
  chain.sort = jest.fn(() => makeChainable(resolveValue));
  chain.limit = jest.fn(() => makeChainable(resolveValue));
  chain.lean = jest.fn(() => Promise.resolve(resolveValue));
  chain.exec = jest.fn(() => Promise.resolve(resolveValue));
  return chain;
}

module.exports = {
  find: jest.fn(() => makeChainable([])),
  findById: jest.fn().mockResolvedValue(null),
  findByIdAndUpdate: jest.fn().mockResolvedValue(null),
  countDocuments: jest.fn().mockResolvedValue(5),
};
