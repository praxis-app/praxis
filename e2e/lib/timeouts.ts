const slowMo = Number.parseInt(process.env.PLAYWRIGHT_SLOW_MO ?? '0', 10);
const SLOW_MO_MULTIPLIER = 10;

export const scaleForSlowMo = (value: number) =>
  slowMo > 0 ? value * SLOW_MO_MULTIPLIER : value;

export const testTimeout = scaleForSlowMo;
