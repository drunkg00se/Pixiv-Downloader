onmessage = async (evt) => {
  const { frames, delay, cnum = 256 } = evt.data;
  const bitmaps = await Promise.all(frames.map((blob) => createImageBitmap(blob)));

  const width = bitmaps[0].width;
  const height = bitmaps[0].height;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const u8arrs = [];

  for (let i = 0; i < bitmaps.length; i++) {
    ctx?.drawImage(bitmaps[i], 0, 0);
    u8arrs.push(ctx?.getImageData(0, 0, width, height).data);
  }

  const png = UPNG.encode(u8arrs, width, height, cnum, delay, { loop: 0 });
  if (!png) console.error('Convert Apng failed.');
  postMessage(png, [png]);
};
