import Ember from 'ember';
import reduce from 'ember-pipeline/utils/reduce';
import isPromise from 'ember-pipeline/utils/is-promise';

const { typeOf } = Ember;

const applyFn = (maybeFn, ...args) => {
  if (typeOf(maybeFn) === 'function') {
    return maybeFn(...args);
  }
  if (maybeFn && typeOf(maybeFn.fn) === 'function') {
    return maybeFn.fn(...args);
  }
  return maybeFn;
};
const makeFn = maybeFn => (...args) => applyFn(maybeFn, ...args);
const invokeFunction = (acc, fn) => isPromise(acc)
  ? acc.then(fn)
  : fn(acc);

export default function pipe(fns = []) {
  return (...args) =>
    reduce(fns, (acc, curr, idx) => {
      let fn = makeFn(curr);
      return idx === 0
        ? fn(...args)
        : invokeFunction(acc, fn);
    }, undefined);
}
