import createSagaMiddleware from 'redux-saga'
import { createStore, applyMiddleware } from 'redux'
import { channel } from 'redux-saga'
import { put, take, call, fork } from 'redux-saga/effects'

export const RETURN = "__SAGAREDUCER_RETURN"

export const next = state => put({ type: RETURN, next: state })

const sagaMiddleware = createSagaMiddleware()

function reducer(state, { type, next }) {
  if (type === RETURN) return next
  return state
}

function* watch(sagaReducer) {
  const chan = yield call(channel)
  const task = sagaReducer(chan)
  while (true) {
    const action = yield take(input => input !== RETURN)
    const { type } = action    
    if (task[type]) {
      yield fork(task[type], action)
    }
    // eslint-disable-next-line
  }
}

export default function createSagaStore(sagaReducer, initialState, rootSaga, ...middleware) {
  middleware.unshift(sagaMiddleware)
  const store = createStore(reducer, initialState, applyMiddleware(...middleware))

  sagaMiddleware.run(function* () {
    yield [fork(watch, sagaReducer)].concat(rootSaga)
  })
  
  return store
}
