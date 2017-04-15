export const CANCEL_SYMBOL = '@@ember-pipeline/cancel';
export const IS_PIPELINE = '@@ember-pipeline/is-pipeline';
export const IS_CANCELLED = '@@ember-pipeline/is-cancelled';

export let CANCEL_REASON = () => {};
export const CANCEL = reason => CANCEL_REASON = () => reason;
