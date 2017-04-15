import Ember from 'ember';

const { isNone } = Ember;

/**
 * Returns true if object is destroyed.
 *
 * @export
 * @param {any} context
 * @returns {Boolean}
 */
export default function isDestroyed(context) {
  return !!context && (context.isDestroyed || context.isDestroying || isNone(context));
}
