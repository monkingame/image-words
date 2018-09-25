import ifExistUser from '../UserData'

describe('UserData test', () => {
  it('init data test', () => {
    expect(
      ifExistUser(undefined)
    ).toEqual(
      undefined
      )

    expect(
      ifExistUser({ username: '', password: '' })
    ).toEqual(
      undefined
      )
  })

  it('if exist user', () => {
    expect(
      ifExistUser({ username: 'a', password: 'a' })
    ).toEqual(
      { id: 1, username: 'a' }
      )

    expect(
      ifExistUser({ username: 'b', password: 'b' })
    ).toEqual(
      { id: 2, username: 'b' }
      )

    expect(
      ifExistUser({ username: 'aa', password: 'a' })
    ).toEqual(
      undefined
      )
  })
});
