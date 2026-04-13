import '@testing-library/jest-dom';

const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: any[]) => {
  const msg = args[0] || '';
  if (
    typeof msg === 'string' &&
    (/Failed to load profile|Failed to fetch addresses|Failed to create artist|Registration error|API failure/.test(msg))
  ) {
    return;
  }
  originalError(...args);
};

console.warn = (...args: any[]) => {
  const msg = args[0] || '';
  if (
    typeof msg === 'string' &&
    (/Mock fetch warning|Some other mock warning pattern/.test(msg))
  ) {
    return;
  }
  originalWarn(...args);
};