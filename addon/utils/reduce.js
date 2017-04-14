import Ember from 'ember';
import pureAssign from 'ember-pipeline/utils/pure-assign';
import { CANCEL_REASON, IS_CANCELLED } from 'ember-pipeline/-symbols';

const { get } = Ember;

function isDestroyed(context) {
  return context && (context.isDestroyed || context.isDestroying);
}

function createCancellation({ result, fnName, reason }) {
  return pureAssign(IS_CANCELLED, { result, fnName, reason });
}

export default function reduce(values, fn, acc) {
  for (let i = 0; i < values.length; i++) {
    let step = values[i];
    let val = fn(acc, step, i, values);
    let context = get(step, 'context');
    // find better way to cancel
    if (isDestroyed(context)) {
      acc = createCancellation({
        result: acc,
        fnName: step.fnName,
        reason: `${context.toString()} destroyed`
      });
      break;
    }
    if (val === CANCEL_REASON) {
      acc = createCancellation({
        result: acc,
        fnName: step.fnName,
        reason: CANCEL_REASON()
      });
      break;
    }
    acc = val;
  }
  return acc;
}
