import createSagaMiddleware from 'redux-saga';
import { createStore, applyMiddleware } from 'redux';
import { fork } from 'redux-saga/effects';

import { reducer, watch, next } from './utils';

const sagaMiddleware = createSagaMiddleware();

export default function createSagaStore(sagaReducer, initialState, rootSaga, ...middleware) {
  middleware.unshift(sagaMiddleware);
  const store = createStore(reducer, initialState, applyMiddleware(...middleware));
  sagaMiddleware.run(function* () {
    yield [fork(watch, sagaReducer)].concat(rootSaga);
  });
  return store;
}

export { next }
