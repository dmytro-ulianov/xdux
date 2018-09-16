<img src="./assets/xdux_logo.png" style="width: 150px; height: 50px"/>
<br />

An opinionated [redux](https://redux.js.org/) library for creating actions and reducers, that gives you an ability to declare actions and handlers in one place.

## Getting started

### Setup

Xdux requires [ramda](https://github.com/ramda/ramda) and [redux-actions](https://github.com/redux-utilities/redux-actions) to be installed.

```bash
npm install --save @drukas/xdux ramda redux-actions redux
```

or

```bash
yarn add @drukas/xdux ramda redux-actions redux
```

### Use

Here is the example of simple xdux module.

`./module.js`

```js
import * as R from 'ramda'
import xdux from '@drukas/xdux'

export const config = {
  namespace: 'My module' // used as prefix for actions
  sliceName: 'myModule' // state in store accessable as store.myModule
}

export const initialState = {
  count: 0,
  lib: { name: 'xdux' },
}

export const lenses = {
  count: R.lensProp('count'),
  libName: R.lensPath(['lib', 'name']),
}

export const { createAction, module, sliceSelector } = xdux({
  config,
  initialState,
})

export default module
```

If you are not familiar with lenses you can learn about it [here](http://randycoulman.com/blog/2016/07/12/thinking-in-ramda-lenses/).
But basically lens is a unit that combines both set and get functions.

`./actions.js`

```js
import * as R from 'ramda'
import myModule, { createAction, lenses } from './module'

/* There are two ways of creating actions and handlers */

/* The first "two-steps" way */
const setCount = createAction('Set count')
const setLibName = createAction('Set lib name')
myModule.handlers({
  [setCount]: (state, { payload }) => R.set(lenses.count, payload, state),
  [setLibName]: (state, { payload }) => R.set(lenses.libName, payload, state),
})

/* The second "xdux" way */
const { setCount, setLibName } = myModule.actions({
  setCount: [
    'Set count',
    (state, { payload }) => R.set(lenses.count, payload, state),
  ],
  setLibName: [
    'Set lib name',
    (state, { payload }) => R.set(lenses.libName, payload, state),
  ],
})

/* As you can see both handlers look almost the same, the only difference
   is the lens. Xdux provided few simple helpers for that cases.
*/
import { apply, assign } from '@drukas/xdux'

const { setCount, incrementCount } = myModule.actions({
  setCount: ['Set count', assign(lenses.count)],
  incrementCount: ['Increment count', apply(lenses.count, x => x + 1)],
})
```

`./selectors.js`

```js
import * as R from 'ramda'
import { lenses, sliceSelector as _ } from './module'

export const getCount = _(R.view(lenses.count))
export const getLibName = _(R.view(lenses.libName))
```

And then when it's time to use it as a reducer, you simply do

```js
import { combineReducers } from 'redux'
import myModule from './module'

const myReducer = myModule.reducer()

/* also you can access module sliceName via reducer */
myReducer.sliceName // myModule
```

### Types

**`xdux({ initialState, config: { namespace, sliceName } })`**
