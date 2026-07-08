import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node', // Service層のテストは純粋な計算なのでnodeで十分
  testMatch: ['**/__tests__/**/*.test.ts'],
};

export default createJestConfig(config);
