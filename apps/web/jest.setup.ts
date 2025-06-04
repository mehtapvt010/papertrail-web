// apps/web/jest.setup.ts  (executed before every test file)
import { webcrypto } from 'crypto';
import { TextEncoder, TextDecoder } from 'util';

Object.defineProperty(globalThis, 'crypto', {
  value: webcrypto,          // ⇦ Node’s full Web Crypto
  configurable: true
});

globalThis.TextEncoder  ||= TextEncoder as any;
globalThis.TextDecoder  ||= TextDecoder as any;

/* Blob.arrayBuffer() polyfill so all Blobs work under Jest */
if (!Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function () {
    return Promise.resolve(new Uint8Array(this.size).buffer);
  };
}
