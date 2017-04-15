import Ember from 'ember';
import isDestroyed from 'ember-pipeline/utils/is-destroyed';
import { module, test } from 'qunit';

const { Object: EmberObject, ObjectProxy } = Ember;

module('Unit | Utility | is destroyed');

let testData = [
  {
    label: 'POJOs',
    value: { foo: 'bar' },
    expected: false
  },
  {
    label: 'EmberObjects',
    value: EmberObject.create({ foo: 'bar' }),
    expected: false
  },
  {
    label: 'ObjectProxies',
    value: ObjectProxy.create({
      content: EmberObject.create({ foo: 'bar' })
    }),
    expected: false
  }
];

testData.forEach(({ label, value, expected }) => {
  test(`it works with ${label}`, function(assert) {
    let obj = (value.isDestroyed && value.isDestroyed()) || value;
    let result = isDestroyed(obj);
    assert.equal(result, expected, `should be ${expected}`);
  });
});
