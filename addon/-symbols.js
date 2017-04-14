export const CANCEL_SYMBOL = '@@ember-pipeline/cancel';
export const IS_PIPELINE_SYMBOL = '@@ember-pipeline/is-pipeline';
export const IS_CANCELLED_SYMBOL = '@@ember-pipeline/is-cancelled';

export let CANCEL_REASON = () => {};
export const CANCEL = reason => CANCEL_REASON = () => reason;
export const IS_CANCELLED = { [IS_CANCELLED_SYMBOL]: true };
export const IS_PIPELINE = { [IS_PIPELINE_SYMBOL]: true };
