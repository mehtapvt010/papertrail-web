// apps/web/jest.setup.ts
import { webcrypto } from 'crypto';
import { TextEncoder, TextDecoder } from 'util';

Object.defineProperty(globalThis, 'crypto', {
  value: webcrypto,
  configurable: true
});

globalThis.TextEncoder ||= TextEncoder as any;
globalThis.TextDecoder ||= TextDecoder as any;

/* Blob.arrayBuffer() polyfill so all Blobs work under Jest */
if (!Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function () {
    return Promise.resolve(new Uint8Array(this.size).buffer);
  };
}

// 🧪 Mock tesseract.js so tests don’t load WASM or fail in Node
jest.mock('tesseract.js', () => ({
  createWorker: () => ({
    loadLanguage: jest.fn().mockResolvedValue(undefined),
    initialize: jest.fn().mockResolvedValue(undefined),
    recognize: jest.fn().mockResolvedValue({ data: { text: 'MOCK_OCR' } }),
    terminate: jest.fn().mockResolvedValue(undefined),
  }),
}));
