import { processAndUpload } from '../upload/upload';

// 👇 Patch all Blob instances (critical fix!)
if (!Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function () {
    return Promise.resolve(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer);
  };
}

// 👇 Mock image compression (returns a dummy Blob)
jest.mock('browser-image-compression', () => {
  const blob = new Blob([new Uint8Array(8)], { type: 'image/png' });
  return {
    __esModule: true,
    default: async () => blob,
  };
});

// 👇 Mock Supabase client
const mockUpload = jest.fn().mockResolvedValue({ data: {} });
const mockInsert = jest.fn().mockResolvedValue({ error: null });
const mockGetUser = jest.fn().mockResolvedValue({
  data: { user: { id: 'user-123' } },
  error: null,
});

jest.mock('@/lib/supabase/browser', () => ({
  supabaseBrowser: () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: () => ({
      insert: mockInsert,
    }),
    storage: {
      from: () => ({
        upload: mockUpload,
      }),
    },
  }),
}));

// 👇 Mock OCR and doc field insert
jest.mock('@/lib/ocr/ocr', () => ({
  runOcr: jest.fn().mockResolvedValue({ text: 'mocked ocr text', latency: 42 }),
  storeRawOcr: jest.fn().mockResolvedValue(undefined),
}));

test('processAndUpload compresses + encrypts + uploads + OCR', async () => {
  const fakeFile = new File([new Uint8Array([137, 80, 78, 71])], 'test.jpg', {
    type: 'image/jpeg',
  });

  const result = await processAndUpload(fakeFile, 'user-123', () => null);

  expect(result.docId).toBeDefined();
  expect(result.latency).toBeGreaterThan(0);
  expect(mockUpload).toHaveBeenCalledTimes(2);
  expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-123' }));
});
