import Ember from 'ember';
import Pipeline from 'ember-pipeline/pipeline';
import pureAssign from 'ember-pipeline/utils/pure-assign';
import isObject from 'ember-pipeline/utils/is-object';

const {
  assert,
  isPresent,
  typeOf
} = Ember;

/**
 * Pipeline cancellation token.
 *
 * @export
 */
export { CANCEL } from 'ember-pipeline/-symbols';

/**
 * Creates a new pipeline instance for a given context object and a sequential
 * series of steps.
 *
 * @export
 * @param {Object} context
 * @param {Array<object>} [steps=[]]
 * @returns {Pipeline}
 */
export function pipeline(context, steps = []) {
  assert('[ember-pipeline] Must have context object to create a new pipeline', isPresent(context)
    && isObject(context));
  return Pipeline.create({ context, steps });
}

/**
 * Returns a simple reference to a function by reference or its name.
 *
 * @export
 * @param {Function|String} fnName
 * @param {Object} [opts={}]
 * @returns {Object}
 */
export function step(fnName, opts = {}) {
  if (typeOf(fnName) === 'function') {
    return pureAssign({ fn: fnName }, opts );
  }

  return pureAssign({ fnName }, opts );
}
