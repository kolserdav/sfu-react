import path from 'path-browserify';
import { useEffect, useMemo, useState } from 'react';
import { container } from 'webpack';
import storeWindowResize from '../store/windowResize';
import { createEpisodes, createVideoChunks, Episode, getVideoTime } from '../types/interfaces';
import { FULL_HD_COEFF } from '../utils/constants';
import { log } from '../utils/lib';
import Request from '../utils/request';

// eslint-disable-next-line import/prefer-default-export
export const useLoadVideos = ({
  dirName,
  server,
  port,
  token,
  controlsRef,
}: {
  dirName: string;
  server: string;
  port: number;
  token: string;
  controlsRef: React.RefObject<HTMLDivElement>;
}) => {
  const [dir, setDir] = useState<string[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [videoTime, setVideoTime] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  const request = useMemo(() => new Request({ server, port }), [server, port]);

  const resizeHandler = useMemo(
    () => () => {
      const { current } = controlsRef;
      if (typeof window !== 'undefined' && current) {
        const { height: controlsHeight } = current.getBoundingClientRect();
        const { innerHeight, innerWidth } = window;
        let _width = innerWidth;
        let _height = _width / FULL_HD_COEFF;
        if (_height > innerHeight - controlsHeight) {
          _height = innerHeight - controlsHeight;
          _width = _height * FULL_HD_COEFF;
        }
        setWidth(_width);
        setHeight(_height);
      }
    },
    [controlsRef]
  );

  /**
   * Set width and height
   */
  useEffect(() => {
    resizeHandler();
  }, [resizeHandler]);

  /**
   * Listen window resize
   */
  useEffect(() => {
    const cleanSubs = storeWindowResize.subscribe(() => {
      resizeHandler();
    });
    return () => {
      cleanSubs();
    };
  }, [resizeHandler]);

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
    setVideoTime(getVideoTime(chunks));
    setEpisodes(_episodes);
  }, [dir, request, dirName]);

  return { episodes, videoTime, width, height };
};

export const usePlay = ({ episodes, videoTime }: { episodes: Episode[]; videoTime: number }) => {
  const [played, setPlayed] = useState<boolean>(false);
  const [replay, setReplay] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const [maxTime, setMaxTime] = useState<number>(0);

  const onPlayClickHandler = useMemo(
    () => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      setPlayed(!played);
      if (replay) {
        setTime(0);
        setReplay(false);
      }
    },
    [played, replay]
  );

  const onChangeTimeHandler = useMemo(
    () => (e: React.ChangeEvent<HTMLInputElement>) => {
      const {
        target: { value },
      } = e;
      setTime(parseFloat(value));
    },
    []
  );

  /**
   * Set max time
   */
  useEffect(() => {
    setMaxTime(videoTime);
  }, [videoTime]);

  /**
   * Play interval
   */
  useEffect(() => {
    let interval = setInterval(() => {
      /** */
    }, Infinity);
    if (played) {
      interval = setInterval(() => {
        let _time = time;
        _time = (_time * 10 + 1) / 10;
        if (_time >= maxTime) {
          clearInterval(interval);
          setReplay(true);
          setPlayed(false);
        }
        setTime(_time);
      }, 100);
    }
    return () => {
      clearInterval(interval);
    };
  }, [played, time, maxTime]);

  return { played, time, maxTime, onPlayClickHandler, onChangeTimeHandler, replay };
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
