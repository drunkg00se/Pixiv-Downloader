// Lossless encoding (0=lossy(default), 1=lossless).
// quality: between 0 and 100. For lossy, 0 gives the smallest
// size and 100 the largest. For lossless, this
// parameter is the amount of effort put into the
// compression: 0 is the fastest but gives larger
// files compared to the slowest, but best, 100.
// method: quality/speed trade-off (0=fast, 6=slower-better)

let webpApi = {};
Module.onRuntimeInitialized = () => {
  webpApi = {
    init: Module.cwrap('init', '', ['number', 'number', 'number']),
    createBuffer: Module.cwrap('createBuffer', 'number', ['number']),
    addFrame: Module.cwrap('addFrame', 'number', ['number', 'number', 'number']),
    generate: Module.cwrap('generate', 'number', []),
    freeResult: Module.cwrap('freeResult', '', []),
    getResultPointer: Module.cwrap('getResultPointer', 'number', []),
    getResultSize: Module.cwrap('getResultSize', 'number', [])
  };

  postMessage('ok');
};

onmessage = async (evt) => {
  const { frames, delays, lossless = 0, quality = 95, method = 4 } = evt.data;

  webpApi.init(lossless, quality, method);

  const bitmaps = await Promise.all(frames.map((blob) => createImageBitmap(blob)));
  const width = bitmaps[0].width;
  const height = bitmaps[0].height;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');

  for (let i = 0; i < bitmaps.length; i++) {
    ctx?.drawImage(bitmaps[i], 0, 0);
    const webpBlob = await canvas.convertToBlob({
      type: 'image/webp',
      quality: lossless ? 1 : quality / 100
    });
    const buffer = await webpBlob.arrayBuffer();
    const u8a = new Uint8Array(buffer);
    const pointer = webpApi.createBuffer(u8a.length);

    Module.HEAPU8.set(u8a, pointer);
    webpApi.addFrame(pointer, u8a.length, delays[i]);
    postMessage(((i + 1) / bitmaps.length) * 100);
  }

  webpApi.generate();
  const resultPointer = webpApi.getResultPointer();
  const resultSize = webpApi.getResultSize();
  const result = new Uint8Array(Module.HEAP8.buffer, resultPointer, resultSize);
  postMessage(result);
  webpApi.freeResult();
};
