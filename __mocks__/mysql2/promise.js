// Mock for mysql2/promise
const mockConnection = {
  ping: jest.fn().mockResolvedValue(true),
  release: jest.fn(),
  end: jest.fn().mockResolvedValue(undefined),
  query: jest.fn().mockResolvedValue([[], []]),
  execute: jest.fn().mockResolvedValue([[], []])
};

const mockPool = {
  getConnection: jest.fn().mockResolvedValue(mockConnection),
  query: jest.fn().mockResolvedValue([[], []]),
  execute: jest.fn().mockResolvedValue([[], []]),
  end: jest.fn().mockResolvedValue(undefined)
};

const mysql = {
  // Update createPool to accept an optional config parameter
  createPool: jest.fn((config = {}) => mockPool)
};

module.exports = mysql;
