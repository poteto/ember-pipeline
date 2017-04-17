import Ember from 'ember';

const {
  assert,
  get,
  typeOf,
  set
} = Ember;

/**
 * A simple reference to a function by reference or its name.
 *
 * @export
 * @class Step
 */
export default class Step {
  constructor(fn, opts = {}) {
    assert(
      `[ember-pipeline] \`${fn}\` must be a function or string`,
      typeOf(fn) === 'function' || typeOf(fn) === 'string'
    );
    this.opts = opts;
    this.isBound = false;
    this.isPerformed = false;
    if (typeOf(fn) === 'function') {
      this.fn = fn;
    }
    if (typeOf(fn) === 'string') {
      this.fnName = fn;
    }
  }

  bindTo(context = {}) {
    let fn = this.fn || get(context, this.fnName);
    assert(
      `[ember-pipeline] \`${fn}\` is not a function or method on ${context.toString()}`,
      typeOf(fn) === 'function'
    )
    set(this, 'fn', fn.bind(context));
    set(this, 'context', context);
    set(this, 'isBound', true);
    return this;
  }

  perform(...args) {
    set(this, 'isPerformed', false); // step needs to be manually marked as performed
    if (!this.isBound) {
      return;
    }
    return this.fn(...args);
  }

  markPerformed() {
    return set(this, 'isPerformed', true);
  }
}

/**
 * Creates a new Step instance.
 *
 * @export
 * @param {any}
 * @returns {Step}
 */
export function step(...args) {
  return new Step(...args);
}
