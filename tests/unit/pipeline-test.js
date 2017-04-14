import Ember from 'ember';
import sinon from 'sinon';
import { pipeline, step, CANCEL } from 'ember-pipeline';
import { IS_PIPELINE_SYMBOL } from 'ember-pipeline/-symbols';
import { module, test } from 'qunit';

let sandbox;
const {
  Object: EmberObject,
  RSVP: { resolve },
  run } = Ember;
const dummy = {
  makeCalculationPipeline() {
    return pipeline(this, [
      step('step1'),
      step('step2'),
      step('step3')
    ]).onCancel((cancellation) => this.handleCancel(cancellation));
  },
  step1(v) {
    return v;
  },
  step2(v) {
    let value = v + v;
    if (value > 10) {
      return CANCEL('Cannot be greater than 5');
    }
    return value;
  },
  step3(v) {
    return this.result = v * v;
  },
  handleCancel(cancellation) {
    switch (cancellation.fnName) {
      case 'step1':
        this.result = `cancelled on step1 - last value: ${cancellation.result}. Reason: ${cancellation.reason}`;
        break;
      case 'step2':
        this.result = `cancelled on step2 - last value: ${cancellation.result}. Reason: ${cancellation.reason}`;
        break;
      case 'step3':
        this.result = `cancelled on step3 - last value: ${cancellation.result}. Reason: ${cancellation.reason}`;
        break;
      default:
        this.result = 'no cancel handler'
        break;
    }
  },
  calculate(...args) {
    return this.makeCalculationPipeline().perform(...args);
  }
};

module('Unit | Main | index', {
  beforeEach() {
    dummy.result = undefined;
    sandbox = sinon.sandbox.create();
  },
  afterEach() {
    sandbox.restore();
  }
});

test('it handles happy path', function(assert) {
  let spy = sandbox.spy(dummy, 'handleCancel');
  assert.equal(dummy.calculate(1), 4);
  assert.equal(dummy.calculate(2), 16);
  assert.equal(dummy.calculate(3), 36);
  assert.equal(dummy.calculate(4), 64);
  assert.equal(dummy.calculate(5), 100);
  assert.equal(spy.callCount, 0, 'should not invoke cancel handler');
});

test('it handles unhappy path', function(assert) {
  let spy = sandbox.spy(dummy, 'step3');
  dummy.calculate(1);
  assert.equal(dummy.result, 4);
  assert.equal(spy.callCount, 1);

  dummy.calculate(10);
  assert.equal(dummy.result, 'cancelled on step2 - last value: 10. Reason: Cannot be greater than 5');
  assert.equal(spy.callCount, 1, 'should abort chain');

  dummy.calculate(1);
  assert.equal(dummy.result, 4);
  assert.equal(spy.callCount, 2);
});

test('#pipeline returns new pipeline instance', function(assert) {
  let obj = {
    foo(val) {
      return 'foo' + val;
    }
  };
  let pipelineInstance = pipeline(obj, [step('foo')]);
  assert.ok(pipelineInstance.get(IS_PIPELINE_SYMBOL));
  assert.equal(pipelineInstance.perform('bar'), 'foobar');
});

test('#pipeline handles steps that returns a promise', function(assert) {
  let done = assert.async();
  let obj = {
    foo(val) {
      return resolve('Foo' + val);
    },
    baz(val) {
      return val + 'Baz';
    }
  };
  let pipelineInstance = pipeline(obj, [
    step('foo'),
    step('baz')
  ]);
  pipelineInstance.perform('Bar').then((result) => {
    assert.equal(result, 'FooBarBaz');
    done();
  });
});

test('#pipeline throws an error if context is missing or not an object', function(assert) {
  assert.throws(() => pipeline(undefined, []));
  assert.throws(() => pipeline(null, []));
  assert.throws(() => pipeline([]));
  assert.throws(() => pipeline(1, []));
});

test('#pipeline handles steps that are functions', function(assert) {
  let obj = {
    qux(v) {
      return v + 'Qux';
    }
  };
  let pipelineInstance = pipeline(obj, [
    step(x => 'Foo' + x),
    step(x => x + 'Baz'),
    step('qux')
  ]);
  assert.equal(pipelineInstance.perform('Bar'), 'FooBarBazQux');
});

test('#step accepts function or string', function(assert) {
  assert.equal(step(x => x * x).fn(2), 4);
  assert.equal(step('foo').fnName, 'foo');
});

test('it halts reducer when the context object is destroyed', function(assert) {
  let done = assert.async();
  let obj = EmberObject.create({
    foo(val) {
      return 'foo' + val;
    },
    toString() {
      return '<dummy>';
    }
  });
  let pipelineInstance = pipeline(obj, [step('foo')]);
  let expectedResult = {
    '@@ember-pipeline/is-cancelled': true,
    fnName: 'foo',
    reason: '<dummy> destroyed',
    result: undefined
  };
  run(() => {
    obj.destroy();
    assert.deepEqual(pipelineInstance.perform('bar'), expectedResult);
    done();
  });
});
