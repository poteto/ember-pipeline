import reduce from 'ember-pipeline/utils/reduce';
import { CANCEL } from 'ember-pipeline';
import { IS_CANCELLED_SYMBOL } from 'ember-pipeline/-symbols';
import { module, test } from 'qunit';

module('Unit | Utility | reduce');

test('it mimics `Array.reduce`', function(assert) {
  assert.equal(reduce([1, 2, 3], (acc, curr) => acc + curr, 0), 6);
  assert.deepEqual(reduce([1, 2, 3], (acc, curr) => [...acc, curr * 2], []), [2, 4, 6]);
});

test('it short-circuits if it encounters a `CANCEL` token', function(assert) {
  let expectedResult = {
    [IS_CANCELLED_SYMBOL]: true,
    result: 10, // <- last result before cancellation
    reason: undefined,
    fnName: undefined
  };
  let fns = [x => x + 1, () => CANCEL(), x => x * x];
  let result = reduce(fns, (acc, fn) => fn(acc), 9);

  assert.deepEqual(result, expectedResult);
});
