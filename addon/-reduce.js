import Ember from 'ember';
import Cancellation from 'ember-pipeline/cancellation';
import Step from 'ember-pipeline/step';
import { CANCEL_REASON } from 'ember-pipeline/-symbols';
import isDestroyed from 'ember-pipeline/utils/is-destroyed';

const { get } = Ember;

function markPerformed(step) {
  return step instanceof Step ? step.markPerformed() : false;
}

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
    let val = fn(acc, step, i, values);
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
    markPerformed(step);
    acc = val;
  }
  return acc;
}
