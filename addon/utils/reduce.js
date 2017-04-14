import Ember from 'ember';
import pureAssign from 'ember-pipeline/utils/pure-assign';
import { CANCEL, IS_CANCELLED } from 'ember-pipeline/-symbols';

const { get } = Ember;

export default function reduce(values, fn, acc) {
  for (let i = 0; i < values.length; i++) {
    let step = values[i];
    let val = fn(acc, step, i, values);
    let context = get(step, 'context');
    // find better way to cancel
    if (val === CANCEL || context && (context.isDestroyed || context.isDestroying)) {
      acc = pureAssign(IS_CANCELLED, { result: acc }, { fnName: step.fnName });
      break;
    }
    acc = val;
  }
  return acc;
}
