const R = require('ramda')
const { xdux, apply, assign } = require('./')

const { module: count } = xdux({
  config: { namespace: 'Count', sliceName: 'count' },
  initialState: { name: 'clicks', value: 0 },
})

const lenses = {
  name: R.lensProp('name'),
  value: R.lensProp('value'),
}

const { add, setName } = count.actions({
  add: ['Add', apply(lenses.value, R.add)],
  setName: ['Set name', assign(lenses.name)],
})

const reducer = count.reducer()

const actions = [add(10), setName('double clicks')]

console.log(add(10))
console.log(reducer(null, add(10)))
