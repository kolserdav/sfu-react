import { useEffect, useMemo } from 'react';
import Request from '../utils/request';

// eslint-disable-next-line import/prefer-default-export
export const useLoadVideos = ({
  src,
  server,
  port,
  token,
}: {
  src: string;
  server: string;
  port: number;
  token: string;
}) => {
  const request = useMemo(() => new Request({ server, port }), [server, port]);

  useEffect(() => {
    (async () => {
      const r = await request.getTmpDir({ dirName: src, token });
      console.log(r);
    })();
  }, [src, request, token]);
};
