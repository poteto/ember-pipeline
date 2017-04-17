import Ember from 'ember';
import reduce from 'ember-pipeline/-reduce';
import isPromise from 'ember-pipeline/utils/is-promise';
import Step from 'ember-pipeline/step';

const { typeOf } = Ember;

const applyFn = (maybeFn, ...args) => {
  if (maybeFn instanceof Step) {
    return maybeFn.perform(...args);
  }
  if (typeOf(maybeFn) === 'function') {
    return maybeFn(...args);
  }
  return maybeFn;
};
const makeFn = maybeFn => (...args) => applyFn(maybeFn, ...args);
const invokeFunction = (acc, fn) => isPromise(acc)
  ? acc.then(fn)
  : fn(acc);

/**
 * Pipe that also accepts `Step`s as functions.
 *
 * @export
 * @param {Array<function|Step>} [steps=[]]
 * @returns
 */
export default function pipe(steps = []) {
  return (...args) =>
    reduce(steps, (acc, curr, idx) => {
      let fn = makeFn(curr);
      return idx === 0
        ? fn(...args)
        : invokeFunction(acc, fn);
    }, undefined);
}
