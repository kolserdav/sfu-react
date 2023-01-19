import path from 'path-browserify';
import { useEffect, useMemo, useState } from 'react';
import { createEpisodes, createVideoChunks, Episode } from '../types/interfaces';
import { log } from '../utils/lib';
import Request from '../utils/request';

// eslint-disable-next-line import/prefer-default-export
export const useLoadVideos = ({
  dirName,
  server,
  port,
  token,
}: {
  dirName: string;
  server: string;
  port: number;
  token: string;
}) => {
  const [dir, setDir] = useState<string[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  const request = useMemo(() => new Request({ server, port }), [server, port]);

  /**
   * Get tmp dir
   */
  useEffect(() => {
    (async () => {
      const r = await request.getTmpDir({ dirName, token });
      if (r === 1) {
        return;
      }
      setDir(r);
    })();
  }, [dirName, request, token]);

  /**
   * Create chunks
   */
  useEffect(() => {
    const chunks = createVideoChunks({
      dir,
      dirPath: path.join(request.getOrigin(), request.getTmpPath({ dirName })),
      isBrowser: true,
    });
    const _episodes = createEpisodes({ chunks });
    setEpisodes(_episodes);
  }, [dir, request, dirName]);

  return { episodes };
};

export const useStrokeCanvas = ({
  canvasRef,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}) => {
  useEffect(() => {
    const { current } = canvasRef;
    if (current) {
      const ctx = current.getContext('2d');
      if (ctx) {
        ctx.moveTo(0, 0);
        ctx.lineTo(300, 200);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 300, 200);
        ctx.stroke();
      } else {
        log('error', 'Canvas context is missing', { ctx });
      }
    }
  }, [canvasRef]);
};
