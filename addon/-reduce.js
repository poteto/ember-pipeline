import Ember from 'ember';
import Step from 'ember-pipeline/step';
import Cancellation from 'ember-pipeline/cancellation';
import { CANCEL_REASON } from 'ember-pipeline/-symbols';
import isDestroyed from 'ember-pipeline/utils/is-destroyed';

const { get } = Ember;

/**
 * Short circuitable `reduce`.
 *
 * @export
 * @param {Array} values
 * @param {Function} fn
 * @param {any} acc
 * @returns {any|Cancellation}
 */
export default function reduce(values, fn, acc) {
  for (let i = 0; i < values.length; i++) {
    let step = values[i];
    let stepFn = step instanceof Step ? step.isBound && step.fn : step;
    let val = fn(acc, stepFn, i, values);
    let context = get(step, 'context');
    // find better way to cancel
    if (isDestroyed(context)) {
      acc = new Cancellation({
        step,
        result: acc,
        reason: `${context.toString()} destroyed`
      });
      break;
    }
    if (val === CANCEL_REASON) {
      acc = new Cancellation({
        step,
        result: acc,
        reason: CANCEL_REASON
      });
      break;
    }
    acc = val;
  }
  return acc;
}
