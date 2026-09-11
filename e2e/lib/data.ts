import { randomUUID } from 'node:crypto';

export const ACCESS_TOKEN_KEY = 'access_token';
export const DEFAULT_SERVER_ID = '11111111-1111-1111-1111-111111111111';
export const TEST_PASSWORD = 'Password123!';

export type TestUser = {
  name: string;
  email: string;
  password: string;
  suffix: string;
};

export const INSTANCE_ADMIN_USER: TestUser = {
  name: 'e2e_admin',
  email: 'e2e_instance_admin@example.com',
  password: TEST_PASSWORD,
  suffix: 'instance-admin',
};

export function createTestUser(label = 'user'): TestUser {
  const suffix = randomUUID().slice(0, 8);

  return {
    name: `e2e${label.slice(0, 2)}_${suffix}`,
    email: `e2e_${label}_${suffix}@example.com`,
    password: TEST_PASSWORD,
    suffix,
  };
}

export function createTestMessage(label: string, suffix: string) {
  return `E2E ${label} message ${suffix}`;
}
