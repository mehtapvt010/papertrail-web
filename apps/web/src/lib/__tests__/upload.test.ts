import { processAndUpload } from '../upload/upload';

// 👇 Patch all Blob instances (critical fix!)
if (!Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function () {
    return Promise.resolve(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer);
  };
}

jest.mock('browser-image-compression', () => {
  const blob = new Blob([new Uint8Array(8)], { type: 'image/png' });
  return {
    __esModule: true,
    default: async () => blob
  };
});

jest.mock('@/lib/supabase/browser', () => ({
  supabaseBrowser: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      })
    },
    storage: {
      from: () => ({
        upload: jest.fn().mockResolvedValue({ data: {} }),
      }),
    },
  }),
}));

test('processAndUpload compresses + encrypts + uploads', async () => {
  const fakeFile = new File([new Uint8Array([137, 80, 78, 71])], 'test.jpg', {
    type: 'image/jpeg',
  });

  const { origPath, thumbPath } = await processAndUpload(
    fakeFile,
    'user-123',
    () => null
  );

  expect(origPath).toMatch(/user-123.*\.enc$/);
  expect(thumbPath).toMatch(/_thumb\.enc$/);
});
