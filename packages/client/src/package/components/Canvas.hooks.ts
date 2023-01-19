import path from 'path-browserify';
import { useEffect, useMemo, useState } from 'react';
import { createEpisodes, createVideoChunks, Episode } from '../types/interfaces';
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
    console.log(_episodes);
  }, [dir, request, dirName]);
};
