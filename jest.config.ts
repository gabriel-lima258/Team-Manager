import type { Config } from 'jest'

const config: Config = {
  bail: true, // if a test fails then kill the process
  preset: "ts-jest", 
  testEnvironment: "node"
}

export default config