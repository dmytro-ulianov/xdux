import { over, set } from 'ramda'

/***
 * Set value
 * @param lens
 * @returns {function(state, { payload })}
 */
export const assign = lens => (state, { payload }) => {
  return set(lens, payload, state)
}

/***
 * Apply transformation function to prev value to obtain new value
 * @param lens
 * @param fn :: (prevValue, payload) -> newValue
 * @returns {function(state, { payload })}
 */
export const apply = (lens, fn) => (state, { payload }) => {
  return over(lens, prevValue => fn(prevValue, payload), state)
}
