import exifr from 'exifr';

export async function autoRotate(arrayBuffer: ArrayBuffer): Promise<ArrayBuffer> {
  const orientation = await exifr.orientation(arrayBuffer).catch(() => 1);
  if (!orientation || orientation === 1) return arrayBuffer;  // already upright

  const blob = new Blob([arrayBuffer]);
  const img = await createImageBitmap(blob);

  // create canvas with proper swapped dimensions if needed
  const canvas = new OffscreenCanvas(
    orientation >= 5 && orientation <= 8 ? img.height : img.width,
    orientation >= 5 && orientation <= 8 ? img.width : img.height
  );
  const ctx = canvas.getContext('2d')!;
  ctx.save();

  // orientation ↔ canvas transform
  const map: Record<number, () => void> = {
    2: () => ctx.scale(-1, 1),                // mirror
    3: () => ctx.rotate(Math.PI),
    4: () => { ctx.scale(1, -1); ctx.rotate(Math.PI); },
    5: () => { ctx.rotate(0.5 * Math.PI); ctx.scale(1, -1); },
    6: () => ctx.rotate(0.5 * Math.PI),
    7: () => { ctx.rotate(0.5 * Math.PI); ctx.scale(-1, 1); },
    8: () => ctx.rotate(-0.5 * Math.PI),
  };
  map[orientation]?.();

  // draw and export back to ArrayBuffer
  ctx.drawImage(img, 0, 0);
  ctx.restore();
  const rotated = await canvas.convertToBlob({ type: blob.type, quality: 0.9 });
  return rotated.arrayBuffer();
}
