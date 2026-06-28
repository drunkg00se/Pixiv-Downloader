import { GM_xmlhttpRequest } from '$';

declare const jspdf: typeof import('jspdf');

function downloadBlob(url: string, signal?: AbortSignal): Promise<Blob> {
  signal?.throwIfAborted();

  return new Promise((resolve, reject) => {
    const abortObj = GM_xmlhttpRequest({
      url,
      method: 'GET',
      responseType: 'blob',
      onload(res) {
        resolve(res.response);
      },
      onerror: reject,
      ontimeout: () => reject(new Error(`Timeout fetching ${url}`))
    });

    signal?.addEventListener(
      'abort',
      () => {
        abortObj.abort();
        reject(signal.reason as Error);
      },
      { once: true }
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(blob);
  const { width, height } = bitmap;
  bitmap.close();
  return { width, height };
}

interface PdfPageData {
  dataUrl: string;
  width: number;
  height: number;
}

const JSPDF_CDN = 'https://unpkg.com/jspdf@4.2.1/dist/jspdf.umd.min.js';

function generatePdfInWorker(pages: PdfPageData[]): Promise<Blob> {
  const workerCode = `
importScripts('${JSPDF_CDN}');
self.onmessage = function(e) {
  var pages = e.data;
  var first = pages[0];
  var doc = new jspdf.jsPDF({
    unit: 'px',
    format: [first.width, first.height],
    hotfixes: ['px_scaling'],
    compress: true
  });
  doc.addImage(first.dataUrl, 'PNG', 0, 0, first.width, first.height);
  for (var i = 1; i < pages.length; i++) {
    var page = pages[i];
    doc.addPage([page.width, page.height]);
    doc.addImage(page.dataUrl, 'PNG', 0, 0, page.width, page.height);
  }
  var blob = doc.output('blob');
  self.postMessage(blob);
};
`;

  const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
  const worker = new Worker(URL.createObjectURL(workerBlob));

  return new Promise((resolve, reject) => {
    worker.onmessage = (e) => {
      worker.terminate();
      resolve(e.data);
    };
    worker.onerror = (e) => {
      worker.terminate();
      reject(new Error(`PDF worker error: ${e.message}`));
    };
    worker.postMessage(pages);
  });
}

function generatePdfInMainThread(pages: PdfPageData[]): Blob {
  const { jsPDF } = jspdf;

  const first = pages[0];
  const doc = new jsPDF({
    unit: 'px',
    format: [first.width, first.height],
    hotfixes: ['px_scaling'],
    compress: true
  });

  doc.addImage(first.dataUrl, 'PNG', 0, 0, first.width, first.height);

  for (let i = 1; i < pages.length; i++) {
    const page = pages[i];
    doc.addPage([page.width, page.height]);
    doc.addImage(page.dataUrl, 'PNG', 0, 0, page.width, page.height);
  }

  return doc.output('blob');
}

export async function fetchNovelText(previewUrl: string): Promise<Blob> {
  const json: { text: string; urls: string[] } = await new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      url: previewUrl,
      method: 'GET',
      responseType: 'json',
      onload(res) {
        resolve(res.response);
      },
      onerror: reject,
      ontimeout: () => reject(new Error(`Timeout fetching ${previewUrl}`))
    });
  });

  return new Blob([json.text], { type: 'text/plain' });
}

export async function fetchNovelPdf(urls: string[], signal?: AbortSignal): Promise<Blob> {
  const pages: PdfPageData[] = [];

  for (const url of urls) {
    signal?.throwIfAborted();

    const blob = await downloadBlob(url, signal);
    const [dims, dataUrl] = await Promise.all([getImageDimensions(blob), blobToDataUrl(blob)]);
    pages.push({ dataUrl, width: dims.width, height: dims.height });

    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  if (pages.length === 0) {
    throw new Error('No pages to generate PDF');
  }

  try {
    return await generatePdfInWorker(pages);
  } catch {
    return generatePdfInMainThread(pages);
  }
}
