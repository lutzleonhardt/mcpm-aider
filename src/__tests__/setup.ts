// Mock process.exit to prevent Jest from exiting during tests
process.exit = jest.fn() as never;

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};
