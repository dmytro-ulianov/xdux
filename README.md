<img src="./assets/xdux_logo.svg" style="width: 150px; height: 50px"/>
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

### API

**`xdux({ initialState, config: { namespace, sliceName } })`**

```js
import xdux from '@drukas/xdux'

const count = xdux({
  config: { namespace: 'Count', sliceName: 'count' },
  initialState: 0,
})
```

**`createAction(name, ?payloadCreator, ?metaCreator)`**

```js
import xdux from '@drukas/xdux'

const { createAction } = xdux({
  config: { namespace: 'Count', sliceName: 'count' },
  initialState: 0,
})

// Powered by redux-actions
const increment = createAction('Increment')
increment() // { type: '[Count] Increment', payload: undefined }

// Also you can pass any arguments, that will be stored in payload
const add = createAction('Add')
add(10) // { type: '[Count] Add', payload: 10 }
```

**`sliceSelector(select)`**

```js
import xdux from '@drukas/xdux'

const { sliceSelector } = xdux({
  config: { namespace: 'Count', sliceName: 'count' },
  initialState: 0,
})

const appState = { count: 10 }
const getCount = sliceSelector(count => count)
logCount(appState) // 10

// idiomatic approach is usage with Ramda
import * as R from 'ramda'
const sliceName = 'user'
const user = { name: 'John', profile: { status: 'active' } }
const { sliceSelector as _ } = xdux(/*...*/)

const statusLens = R.lensPath(['profile', 'status'])
const getStatus = _(R.view(statusLens))
getStatus({ user }) // active
```

**`module.action(title, handler)`**

```js
import xdux from '@drukas/xdux'

const { module } = xdux({
  config: { namespace: 'Count', sliceName: 'count' },
  initialState: 0,
})

// Creates both action and handler
const increment = module.action('Increment', state => state + 1)
increment() // { type: '[Count] Increment', payload: undefined }
```

**`module.actions(handlersMap)`**

```js
import xdux from '@drukas/xdux'

const { module } = xdux({
  config: { namespace: 'Count', sliceName: 'count' },
  initialState: 0,
})

// Creates many actions and handlers
const { increment, decrement } = module.actions({
  increment: ['Increment', state => state + 1],
  decrement: ['Decrement', state => state - 1],
})
increment() // { type: '[Count] Increment', payload: undefined }
increment() // { type: '[Count] Decrement', payload: undefined }
```

**`module.handlers(handlersMap)`**

```js
import xdux from '@drukas/xdux'

const { createAction, module } = xdux({
  config: { namespace: 'Count', sliceName: 'count' },
  initialState: 0,
})

// Creates handlers
const increment = createAction('Increment')
const decrement = createAction('Decrement')
module.handlers({
  [increment]: state => state + 1,
  [decrement]: state => state - 1,
})
```

**`module.reducer()`**

```js
import xdux from '@drukas/xdux'

const { module: count } = xdux({
  config: { namespace: 'Count', sliceName: 'count' },
  initialState: 0,
})

const { add, decrement, increment } = count.actions({
  add: ['Add', (state, { payload }) => state + payload],
  decrement: ['Decrement', state => state - 1],
  increment: ['Increment', state => state + 1],
})

const countReducer = count.reducer()

const actions = [increment(), decrement(), add(5)]

actions.reduce(countReducer, 0) // 5
```

**`apply(lens, handler)`**
**`assign(lens)`**

```js
import { lensProp } from 'ramda'
import xdux, { apply, assign } from '@drukas/xdux'

const { module } = xdux({
  config: { namespace: 'Count', sliceName: 'count' },
  initialState: { name: 'clicks', value: 0 },
})
const lenses = {
  name: lensProp('name'),
  count: lensProp('value'),
}

const { add, setName } = module.actions({
  add: ['Add', apply(lenses.value, (value, payload) => value + payload)],
  setName: ['Set name', assign(lenses.name)],
})
```
