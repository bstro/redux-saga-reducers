import { channel } from 'redux-saga';
import { put, take, call, fork } from 'redux-saga/effects';

export const RETURN = "__SAGAREDUCER_RETURN";

export function next(state) {
  return put({ type: RETURN, next: state })
}

export function reducer(state = {}, { type, next }) {
  if (type === RETURN) return next;
  return state;
}

export function noReturns(input) {
  return input !== RETURN;
}

export function* watch(sagaReducer) {
  const chan = yield call(channel);
  const tasks = yield call(sagaReducer, chan);
  while (true) {
    const action = yield take(noReturns);
    const { type } = action;
    if (tasks[type]) {
      yield fork(tasks[type], action);
    }
  }
}
