# ember-pipeline ![Download count all time](https://img.shields.io/npm/dt/ember-pipeline.svg) [![Build Status](https://travis-ci.org/poteto/ember-pipeline.svg?branch=master)](https://travis-ci.org/poteto/ember-pipeline) [![npm version](https://badge.fury.io/js/ember-pipeline.svg)](https://badge.fury.io/js/ember-pipeline) [![Ember Observer Score](http://emberobserver.com/badges/ember-pipeline.svg)](http://emberobserver.com/addons/ember-pipeline)

[Railway oriented programming](https://fsharpforfunandprofit.com/rop/) in Ember. To install:

```
ember install ember-pipeline
```

## Philosophy

`ember-pipeline` allows you to compose a pipeline of (promise aware) methods on an object using "railway oriented programming". That is, if any of the methods in the pipeline returns a `CANCEL` token, the entire pipeline exits and can be optionally handled by another method. If the host `Ember.Object` is destroyed, the pipeline is aborted as well.

For example:

```js
import Ember from 'ember';
import { pipeline, step, CANCEL } from 'ember-pipeline';

const { computed, get } = Ember;

export default Component.extend({
  fetchStoreLocations: computed(function() {
    return pipeline([
      step('requestGeolocation'),
      step('fetchStoresInProximity'),
      step('sortStoresByDistance'),
      step('alwaysCancels')
    ]).onCancel((cancellation) => this.handleCancel(cancellation));
  }),

  requestGeolocation() { /* ... */ },
  fetchStoresInProximity() { /* ... */ },
  sortStoresByDistance() { /* ... */ },

  alwaysCancels() {
    return CANCEL();
  },

  handleCancel(cancellation) {
    switch (cancellation.fnName) {
      case 'requestGeolocation':
        // show error message saying you didn't allow us to use geo api
        break;
      case 'fetchStoresInProximity':
        // no stores around you, sorry!
        break;
      case 'sortStoresByDistance':
        // we used bubble sort
        break;
      default:
        // no cancel handler
        console.log(`last value: ${cancellation.result}, reason: ${cancellation.reason}`);
        break;
    }
  }),

  actions: {
    fetchStoreLocations(...args) {
      return get(this, 'fetchStoreLocations').perform(...args);
    }
  }
});
```

## Usage

First, create a pipeline using `pipeline` and `step`. You can also define a cancel handler:

```js
return pipeline(this, [
  step('step1'),
  step('step2'),
  step('step3')
]).onCancel((cancellation) => this.handleCancel(cancellation));
```

If using inside of an `Ember.Object`, you could make this a computed property:

```js
export default Component.extend({
  myPipeline: computed(function() {
    return pipeline(this, [
      step('step1'),
      step('step2'),
      step('step3')
    ]).onCancel((cancellation) => this.handleCancel(cancellation));
  })
});
```

`step` receives either a method name as a string, or a function:

```js
[step('step1'), step(x => x * x)];
```

In a `step` function, return `CANCEL()` to abort the pipeline:

```js
{
  step1() {
    return CANCEL('optional reason, can be any type');
  }
}
```

Then, to run the pipeline, get the reference to it and `perform` it:

```js
get(this, 'myPipeline').perform(...args);
pipelineInstance.perform(...args);
```

You can compose new pipelines at runtime. For example:

```js
export default Component.extend({
  makePipeline(steps) {
    return pipeline(this, steps)
      .onCancel((cancellation) => this.handleCancel(cancellation));
  },

  // ...

  actions: {
    normal(...args) {
      return this.makePipeline([step('step1'), step('step2')]).perform(...args);
    },

    reverse(...args) {
      return this.makePipeline([step('step2'), step('step1')]).perform(...args);
    }
  }
});
```

## API

Detailed API coming soon!

## Roadmap

- [ ] Support `ember-concurrency` tasks

## Installation

* `git clone <repository-url>` this repository
* `cd ember-pipeline`
* `npm install`
* `bower install`

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
