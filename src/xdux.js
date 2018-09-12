import invariant from 'invariant'
import { createAction, handleActions } from 'redux-actions'
import { prop } from 'ramda'

const makeCreateType = namespace => type => `[${namespace}] ${type}`

export const makeCreateAction = namespace => {
  const createType = makeCreateType(namespace)
  return (name, ...args) => {
    const type = createType(name)
    return createAction(type, ...args)
  }
}

export const makeSliceSelector = sliceName => selector => state =>
  selector(prop(sliceName, state))

/***
 *
 * @param createAction
 * @param initialState
 * @param config
 * @returns Object {
 *   createAction,
 *   sliceSelector,
 *   module: {actions: function, handlers: function, reducer: function},
 * }
 */
const xdux = ({ initialState, config }) => {
  const { namespace, sliceName } = config

  invariant(!!initialState, `Expected initialState to be defined`)

  invariant(
    typeof sliceName === 'string' && typeof namespace === 'string',
    `Expected sliceName and namespace to be a strings`,
  )

  const createAction = makeCreateAction(namespace)

  const sliceSelector = makeSliceSelector(sliceName)

  const handlers = {}

  return {
    createAction,

    sliceSelector,

    module: {
      actions: actionHandlers => {
        const actions = {}
        Object.entries(actionHandlers).forEach(([name, [title, handler]]) => {
          const action = createAction(title)
          actions[name] = action
          handlers[action] = handler
        })
        return actions
      },

      handlers: newHandlers => {
        Object.assign(handlers, newHandlers)
      },

      reducer: () => {
        const reducer = handleActions(handlers, initialState)
        reducer.sliceName = sliceName
        return reducer
      },
    },
  }
}

export default xdux
