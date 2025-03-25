import { Muxer, ArrayBufferTarget } from 'webm-muxer';
import { logger } from '@/lib/logger';

function isBlobArray(frames: Blob[] | ImageBitmap[]): frames is Blob[] {
  return frames[0] instanceof Blob;
}

export async function webm(
  frames: Blob[] | ImageBitmap[],
  delays: number[],
  bitrate: number,
  signal?: AbortSignal
): Promise<Blob> {
  signal?.throwIfAborted();

  if (isBlobArray(frames)) {
    frames = await Promise.all(frames.map((frame) => createImageBitmap(frame)));
  }

  signal?.throwIfAborted();

  const width = frames[0].width;
  const height = frames[0].height;

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: {
      codec: 'V_VP9',
      width,
      height
    }
  });

  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => logger.error(e)
  });

  // https://cconcolato.github.io/media-mime-support/
  videoEncoder.configure({
    codec: 'vp09.00.51.08.01.01.01.01.00',
    width,
    height,
    bitrate: bitrate * 1e6
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

  return new Blob([buffer], { type: 'video/webm' });
}
