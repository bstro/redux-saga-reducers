import { channel } from 'redux-saga';
import { next, reducer, watch, noReturns, RETURN } from './utils';
import { put, take, call, fork } from 'redux-saga/effects';

import { nextify } from './test-helpers.js';

test('utils exports a return constant', (...args) => {
  expect(RETURN).toBeDefined();
});

describe('next', () => {
  it('next function returns a javascript object', () => {
    const state = { foo: 'bar' };
    expect(next(state)).toEqual(
      put({ type: RETURN, next: state })
    );
  });
});

describe('reducer', () => {
  const state = { lorem: 'ipsum' };

  it('returns the current state on every action except for RETURN', () => {
    const action = { type: "FOOBARBAZ", next: 'foo' };
    expect(reducer(state, action)).toEqual(state);
  });

  it('on action.type===RETURN, returns the next state', () => {
    const action = { type: RETURN, next: 'bar' };
    expect(reducer(state, action)).toEqual(action.next);
  });
});

describe('noReturns filter fn', () => {
  const input1 = RETURN;
  const input2 = "FOO";
  
  it('returns false if input is RETURN', () => {
    expect(noReturns(input1)).toBeFalsy();
  });

  it('returns true otherwise', () => {
    expect(noReturns(input2)).toBeTruthy();
  });
});

describe('watch', () => {
  const fakeChannel = [];
  const fakeSagaReducer = id => id;
  function* fakeTask() { yield 1 }

  let gen;

  it('creates a channel', () => {
    gen = () => watch(fakeSagaReducer).next();
    expect(gen().value).toEqual(call(channel));
  });

  it('sends the channel into the sagaReducer', () => {
    gen = () => nextify(watch(fakeSagaReducer)).next().next(fakeChannel).done();
    expect(gen().value).toEqual(call(fakeSagaReducer, fakeChannel));
  });

  it('waits for all non-RETURN actions', () => {
    gen = () => nextify(watch(fakeSagaReducer)).next().next(fakeChannel).next(fakeTask).done();
    expect(gen().value).toEqual(take(noReturns));
  });

  it('if the task type exists in the sagaReducer, it is forked with the action payload', () => {
    const action = { type: 'foo' };
    const fakeTasks = Object.create({ [action.type]: fakeTask });
    gen = () => nextify(watch(fakeSagaReducer)).next().next(fakeChannel).next(fakeTasks).next(action).done();
    expect(gen().value).toEqual(fork(fakeTasks[action.type], action));
  });

  it('if the task type does not exist in the sagaReducer, it loops', () => {
    const action = { type: 'nope' };
    const fakeTasks = Object.create({});
    gen = () => nextify(watch(fakeSagaReducer)).next().next(fakeChannel).next(fakeTasks).next(action).done();
    expect(gen().value).toEqual(take(noReturns));
  });
});
