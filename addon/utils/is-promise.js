import Ember from 'ember';
import isObject from 'ember-pipeline/utils/is-object';

const { typeOf } = Ember;

function isPromiseLike(obj = {}) {
  return typeOf(obj.then) === 'function'
    && typeOf(obj.catch) === 'function';
}

export default function isPromise(obj) {
  return isObject(obj)
    && isPromiseLike(obj);
}
