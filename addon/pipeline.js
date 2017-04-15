import Ember from 'ember';
import Step from 'ember-pipeline/step';
import pipe from 'ember-pipeline/-pipe';
import { IS_CANCELLED, IS_PIPELINE } from 'ember-pipeline/-symbols';
import isObject from 'ember-pipeline/utils/is-object';

const {
  Object: EmberObject,
  assert,
  get,
  set,
  isPresent,
  runInDebug,
  typeOf
} = Ember;

const Pipeline = EmberObject.extend({
  /**
   * Internal property to check if object is a pipeline instance.
   *
   * @private
   * @property {Boolean}
   */
  [IS_PIPELINE]: true,

  /**
   * Context object.
   *
   * @public
   * @property {Object}
   */
  context: undefined,

  /**
   * Steps in pipeline.
   *
   * @public
   * @property {Array}
   */
  steps: [],

  /**
   * @private
   * @property {Function}
   */
  _pipelineFn: undefined,

  init() {
    this._super(...arguments);
    assert('[ember-pipeline] Must have context object to create a new pipeline', isPresent(this.context) && isObject(this.context));
    runInDebug(() => this._validateSteps(this.steps));
    this.createPipeline(this.steps);
  },

  /**
   * Higher order function that returns a pipe function with given steps.
   *
   * @public
   * @returns {Function}
   */
  createPipeline(steps = []) {
    let context = get(this, 'context');
    let pipeline = pipe(steps.map((s) => s.bindTo(context)));
    return set(this, '_pipelineFn', pipeline);
  },

  /**
   * Invokes the pipeline with arguments. If any of the steps return a `CANCEL`
   * token, the pipeline is aborted and an optional cancel handler is invoked.
   *
   * @param {any} args
   * @returns {any}
   */
  perform(...args) {
    let v = get(this, '_pipelineFn')(...args);
    if (v && v[IS_CANCELLED] && isPresent(this.cancelHandler)) {
      return this.cancelHandler(v);
    }
    return v;
  },

  /**
   * Set a cancel handler for the pipeline.
   *
   * @public
   * @chainable
   * @param {Function} handlerFn
   * @returns {Pipeline}
   */
  onCancel(handlerFn) {
    assert(
      '[ember-pipeline] onCancel handler must be a function',
      typeOf(handlerFn) === 'function'
    );
    this.cancelHandler = handlerFn;
    return this;
  },

  /**
   * Validate steps.
   *
   * @private
   * @param {Array<step>} steps
   * @returns {Void}
   */
  _validateSteps(steps = []) {
    steps.forEach((s) => {
      assert(
        '[ember-pipeline] A pipeline only accepts steps that are created with the `step` function',
        s instanceof Step
      );
    });
  }
});

export default Pipeline;

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
