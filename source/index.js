import { fork } from 'redux-saga/effects';
import { reducer, watch, next } from './utils';

function run(sagaMiddleware, sagaReducer, rootSaga) {
  sagaMiddleware.run(function* () {
    yield [fork(watch, sagaReducer)].concat(rootSaga);
  });
}
const internalReducer = reducer;

export { next, run, internalReducer }
