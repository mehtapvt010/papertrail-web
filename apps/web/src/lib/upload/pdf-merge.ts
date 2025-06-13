import { PDFDocument } from 'pdf-lib';

export async function mergePDF(buffers: ArrayBuffer[]) {
  const master = await PDFDocument.create();
  for (const ab of buffers) {
    const donor = await PDFDocument.load(ab);
    const pages = await master.copyPages(donor, donor.getPageIndices());
    pages.forEach((p) => master.addPage(p));
  }
  return master.save();
}
