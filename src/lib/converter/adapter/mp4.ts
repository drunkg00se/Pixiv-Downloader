import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { logger } from '@/lib/logger';
import { config } from '@/lib/config';

function isBlobArray(frames: Blob[] | ImageBitmap[]): frames is Blob[] {
  return frames[0] instanceof Blob;
}

export async function mp4(
  frames: Blob[] | ImageBitmap[],
  delays: number[],
  signal?: AbortSignal
): Promise<Blob> {
  signal?.throwIfAborted();

  if (isBlobArray(frames)) {
    frames = await Promise.all(frames.map((frame) => createImageBitmap(frame)));
  }

  signal?.throwIfAborted();

  let width = frames[0].width;
  let height = frames[0].height;

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

  let timestamp = 0;

  delays = delays.map((delay) => (delay *= 1000));

  const videoFrames: VideoFrame[] = [];

  signal?.addEventListener(
    'abort',
    () => {
      videoFrames.forEach((frame) => frame.close());
    },
    { once: true }
  );

  for (const [i, frame] of frames.entries()) {
    const videoFrame = new VideoFrame(frame, { duration: delays[i], timestamp });

    videoEncoder.encode(videoFrame);

    videoFrames.push(videoFrame);

    frame.close();
    timestamp += delays[i];
  }

  await videoEncoder.flush();

  videoEncoder.close();
  videoFrames.forEach((frame) => frame.close());

  signal?.throwIfAborted();

  muxer.finalize();

  const { buffer } = muxer.target;

  return new Blob([buffer], { type: 'video/mp4' });
}
