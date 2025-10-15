import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  clearMocks: true,
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
};

export default createJestConfig(customJestConfig);
