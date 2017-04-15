import Ember from 'ember';
import { IS_CANCELLED } from 'ember-pipeline/-symbols';

const {
  assert,
  typeOf,
  isPresent
} = Ember;
const RESULT = '_result';
const STEP = '_step';
const REASON = '_reason';

export default class Cancellation {
  constructor({ result, step, reason }) {
    assert(
      '[ember-pipeline] \`step\` must be defined on Cancellation',
      isPresent(step)
    );
    this[IS_CANCELLED] = true;
    this[RESULT] = result;
    this[STEP] = step;
    this[REASON] = reason;
  }

  get result() {
    return this[RESULT];
  }

  get fnName() {
    let step = this[STEP];
    let fn = step.fn || step;
    return step.fnName || fn.toString();
  }

  get reason() {
    let reason = this[REASON];
    return typeOf(reason) === 'function'
      ? reason()
      : reason;
  }
}
