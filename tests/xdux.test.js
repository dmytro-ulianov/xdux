import xdux from '../src/xdux'

const initialState = { count: 0 }
const config = { namespace: 'test', sliceName: 'test' }

test('xdux is a function', () => {
  expect(typeof xdux).toBe('function')
})

test('throws when no initialState provided', () => {
  expect(() => xdux({ config })).toThrow()
})

test('throws when no config provided', () => {
  expect(() => xdux({ initialState })).toThrow()
})
