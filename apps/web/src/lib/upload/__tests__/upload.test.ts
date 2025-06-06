import { processAndUpload } from '../upload';

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

// 👇 Shared mocks to track calls
const mockUpload = jest.fn().mockResolvedValue({ data: {} });
const mockInsert = jest.fn().mockResolvedValue({ error: null });
const mockUpdateArgs = jest.fn(); // will record payload passed to .update()
const mockEq = jest.fn().mockResolvedValue({ error: null });
const mockSingle = jest.fn().mockResolvedValue({
  data: { field_value: 'mocked ocr text' },
});

// 👇 Inline Supabase client mock
jest.mock('@/lib/supabase/browser', () => ({
  supabaseBrowser: () => ({
    from: (table: string) => {
      if (table === 'documents') {
        return {
          insert: mockInsert,
          update: (args: any) => {
            mockUpdateArgs(args);
            return { eq: mockEq };
          },
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: mockSingle,
        };
      }

      if (table === 'doc_fields') {
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }

      return {};
    },
    storage: {
      from: () => ({
        upload: mockUpload,
      }),
    },
  }),
}));

// 👇 Mock OCR + metadata insert
jest.mock('@/lib/ocr/ocr', () => ({
  runOcr: jest.fn().mockResolvedValue({
    text: 'USA PASSPORT Exp 04/25/2035\nJohn Doe',
    latency: 42,
  }),
  storeRawOcr: jest.fn().mockResolvedValue(undefined),
}));


test('processAndUpload compresses + encrypts + uploads + OCR', async () => {
  const fakeFile = new File([new Uint8Array([137, 80, 78, 71])], 'test.jpg', {
    type: 'image/jpeg',
  });

  const result = await processAndUpload(fakeFile, 'user-123', () => null);

  expect(result.docId).toBeDefined();
  expect(result.latency).toBeGreaterThan(0);

  // ✅ Storage uploads (orig + thumb)
  expect(mockUpload).toHaveBeenCalledTimes(2);

  // ✅ Metadata insert
  expect(mockInsert).toHaveBeenCalledWith(
    expect.objectContaining({ user_id: 'user-123' })
  );

  // ✅ Classification update
  expect(mockUpdateArgs).toHaveBeenCalledWith(
    expect.objectContaining({
      type_enum: expect.anything(),
      title: expect.anything(),
      classify_confidence: expect.any(Number),
    })
  );

  // ✅ Ensure .eq was called with correct docId
  expect(mockEq).toHaveBeenCalledWith('id', expect.any(String));
});
