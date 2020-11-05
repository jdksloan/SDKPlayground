module.exports = {
  cache: false,
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  testRegex: '(/.*.(test|spec)).(jsx?|tsx?)$',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  },
  moduleFileExtensions: ['ts', 'js'],
  collectCoverage: true,
  verbose: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10
    }
  }
};
