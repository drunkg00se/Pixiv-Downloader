import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import type { ConvertMeta, ConvertUgoiraSource } from '..';
import { CancelError } from '@/lib/error';
import { logger } from '@/lib/logger';
import { config } from '@/lib/config';

export async function mp4(
  frames: Blob[] | ImageBitmap[],
  convertMeta: ConvertMeta<ConvertUgoiraSource>
): Promise<Blob> {
  const p = frames.map((frame) => {
    if (frame instanceof Blob) {
      return createImageBitmap(frame);
    } else {
      return frame;
    }
  });
  const bitmaps = await Promise.all(p);

  if (convertMeta.isAborted) throw new CancelError();

  let width = bitmaps[0].width;
  let height = bitmaps[0].height;

  // H264 only supports even sized frames.
  if (width % 2 !== 0) width += 1;
  if (height % 2 !== 0) height += 1;

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: {
      codec: 'avc',
      width,
      height
    },
    fastStart: 'in-memory'
  });

  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => logger.error(e)
  });

  // https://cconcolato.github.io/media-mime-support/
  videoEncoder.configure({
    codec: 'avc1.420034',
    width,
    height,
    bitrate: config.get('mp4Bitrate') * 1e6
  });

  const delays = convertMeta.source.delays.map((delay) => (delay *= 1000));

  let timestamp = 0;
  const videoFrames: VideoFrame[] = [];
  for (let i = 0; i < bitmaps.length; i++) {
    const frame = new VideoFrame(bitmaps[i], { duration: delays[i], timestamp });
    videoFrames.push(frame);
    bitmaps[i].close();

    videoEncoder.encode(frame);
    timestamp += delays[i];
  }

  await videoEncoder.flush();
  if (convertMeta.isAborted) {
    videoFrames.forEach((frame) => frame.close());
    throw new CancelError();
  }

  muxer.finalize();
  const { buffer } = muxer.target;

  videoFrames.forEach((frame) => frame.close());
  return new Blob([buffer], { type: 'video/mp4' });
}
