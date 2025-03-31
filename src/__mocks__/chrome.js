global.chrome = {
  storage: {
    sync: {
      get: jest.fn((keys, callback) =>
        callback({ apiUrl: "http://localhost:5000" })
      ),
    },
    local: {
      set: jest.fn((data, callback) => callback && callback()),
    },
  },
  runtime: {
    id: "mocked-extension-id",
  },
  tabs: {
    create: jest.fn(),
  },
};
