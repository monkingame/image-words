import { LOGIN_REQUEST, REQ_IN, REQ_OUT } from '../actions';
import loginUser, { STATUS_LOGIN_OK, STATUS_LOGOUT } from '../UserLoginReducer'
// import from '../UserLoginReducer'

describe('Reducers test', () => {
  it('loginUser init test', () => {
    expect(
      loginUser(undefined, {})
    ).toEqual({})
  })

  it('loginUser test', () => {
    expect(
      loginUser({}, {
        type: LOGIN_REQUEST,
        user: undefined,
        req: REQ_IN
      })
    ).toEqual({})

    expect(
      loginUser({}, {
        type: LOGIN_REQUEST,
        user: undefined,
        req: REQ_OUT
      })
    ).toEqual({
      id: -1,
      username: '',
      status: STATUS_LOGOUT
    })

    expect(
      loginUser({}, {
        type: LOGIN_REQUEST,
        user: { username: '', password: '' },
        req: REQ_IN
      })
    ).toEqual({})

    expect(
      loginUser({}, {
        type: LOGIN_REQUEST,
        user: { username: '', password: '' },
        req: REQ_OUT
      })
    ).toEqual({
      id: -1,
      username: '',
      status: STATUS_LOGOUT
    })

    expect(
      loginUser({}, {
        type: LOGIN_REQUEST,
        user: { username: 'a', password: 'a' },
        req: REQ_IN
      })
    ).toEqual({
      id: 1,
      username: 'a',
      status: STATUS_LOGIN_OK
    })

    expect(
      loginUser({
        id: 1,
        username: 'a',
        status: STATUS_LOGIN_OK
      }, {
          type: LOGIN_REQUEST,
          user: { username: 'a', password: 'a' },
          req: REQ_IN
        })
    ).toEqual({
      id: 1,
      username: 'a',
      status: STATUS_LOGIN_OK
    })

    expect(
      loginUser({
        id: 1,
        username: 'a',
        status: STATUS_LOGIN_OK
      }, {
          type: LOGIN_REQUEST,
          user: { username: 'b', password: 'b' },
          req: REQ_IN
        })
    ).toEqual({
      id: 2,
      username: 'b',
      status: STATUS_LOGIN_OK
    })

    expect(
      loginUser(
        {
          id: 1,
          username: 'a',
          status: STATUS_LOGIN_OK
        }, {
          type: LOGIN_REQUEST,
          user: { username: 'b', password: 'wrongpassword' },
          req: REQ_IN
        })
    ).toEqual(
      {
        id: 1,
        username: 'a',
        status: STATUS_LOGIN_OK
      })

    expect(
      loginUser({
        id: 1,
        username: 'a',
        status: STATUS_LOGIN_OK
      }, {
          type: LOGIN_REQUEST,
          user: {},
          req: REQ_OUT
        })
    ).toEqual({
      id: -1,
      username: '',
      status: STATUS_LOGOUT
    })

    expect(
      loginUser({
        id: 1,
        username: 'a',
        status: STATUS_LOGIN_OK
      }, {
          type: LOGIN_REQUEST,
          user: undefined,
          req: REQ_OUT
        })
    ).toEqual({
      id: -1,
      username: '',
      status: STATUS_LOGOUT
    })
  })
});
