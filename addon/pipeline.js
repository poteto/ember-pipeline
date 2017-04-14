import Ember from 'ember';
import isObject from 'ember-pipeline/utils/is-object';
import pureAssign from 'ember-pipeline/utils/pure-assign';
import pipe from 'ember-pipeline/utils/pipe';
import { IS_PIPELINE_SYMBOL } from 'ember-pipeline/-symbols';
import { IS_CANCELLED_SYMBOL } from 'ember-pipeline/-symbols';

const {
  Object: EmberObject,
  assert,
  get,
  set,
  isPresent,
  runInDebug,
  typeOf
} = Ember;

export default EmberObject.extend({
  /**
   * Internal property to check if object is a pipeline instance.
   *
   * @private
   * @property {Boolean}
   */
  [IS_PIPELINE_SYMBOL]: true,

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
    this.createPipeline();
  },

  /**
   * Higher order function that returns a pipe function with given steps.
   *
   * @public
   * @returns {Function}
   */
  createPipeline() {
    let context = get(this, 'context');
    let pipeline = pipe(this.steps.map((s) => {
      let fn = s.fn || get(context, s.fnName).bind(context);
      return pureAssign(s, { context, fn });
    }));
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
    if (v && v[IS_CANCELLED_SYMBOL] && isPresent(this.cancelHandler)) {
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
      if (s.fn) {
        assert(`[ember-pipeline] ${s.fn} is not a function`,
          typeOf(s.fn) === 'function');
      }
      if (s.fnName) {
        assert(`[ember-pipeline] ${s.fnName} is not a function`,
          typeOf(get(this.context, s.fnName)) === 'function');
      }
    });
  }
});
