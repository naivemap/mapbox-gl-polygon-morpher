/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // 开启覆盖统计功能
  collectCoverage: true,
  // 指定需要覆盖的文件
  collectCoverageFrom: ['src/*.ts'],
  // 指定输出覆盖统计结果的目录
  coverageDirectory: 'test/coverage/',
  // 指定测试脚本
  testMatch: ['**/test/*.test.js']
}
