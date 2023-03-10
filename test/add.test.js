const { add } = require('../src/index')

describe('加法函数测试', () => {
  test('1加1等于2', () => {
    expect(add(1, 1)).toBe(2)
  })
})
