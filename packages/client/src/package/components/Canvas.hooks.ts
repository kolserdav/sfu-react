/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Canvas.hooks.ts
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import path from 'path-browserify';
import { createRef, useEffect, useMemo, useState } from 'react';
import storeWindowResize from '../store/windowResize';
import {
  createEpisodes,
  createVideoChunks,
  Episode,
  getCountVideos,
  getVideoShifts,
  getVideoTime,
  TOKEN_QUERY_NAME,
} from '../types/interfaces';
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

  return { episodes, videoTime, width, height, dir, request };
};

export const usePlay = ({
  episodes: _episodes,
  videoTime,
}: {
  episodes: Episode[];
  videoTime: number;
}) => {
  const [played, setPlayed] = useState<boolean>(false);
  const [replay, setReplay] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const [maxTime, setMaxTime] = useState<number>(0);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

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
      if (replay) {
        setReplay(false);
      }
      setTime(parseFloat(value));
    },
    [replay]
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
        if (_time > maxTime) {
          clearInterval(interval);
          setReplay(true);
          setPlayed(false);
          return;
        }
        setTime(_time);
      }, 100);
    }
    return () => {
      clearInterval(interval);
    };
  }, [played, time, maxTime]);

  return { played, time, maxTime, onPlayClickHandler, onChangeTimeHandler, replay, episodes };
};

interface VideoTmp {
  id: number;
  ref: React.RefObject<HTMLVideoElement>;
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const useStrokeCanvas = ({
  canvasRef,
  episodes,
  request,
  dirName,
  dir,
  token,
  width,
  height,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  episodes: Episode[];
  request: Request;
  dir: string[];
  dirName: string;
  token: string;
  width: number;
  height: number;
}) => {
  const [videos, setVideos] = useState<VideoTmp[]>([]);

  const inputs = useMemo(
    () =>
      dir.map(
        (item) =>
          `${request.getOrigin()}${request.getTmpPath({
            dirName,
          })}/${item}?${TOKEN_QUERY_NAME}=${token}`
      ),
    [dir, dirName, request, token]
  );

  /**
   * Set video src
   */
  useEffect(() => {
    const _videos: VideoTmp[] = [];
    // TODO calculate x y w h
    console.log(width, height);
    episodes.forEach((item, id) => {
      const { videoCount } = getCountVideos(item.chunks);
      const { shiftX, shiftY } = getVideoShifts({
        videoCount,
        videoHeight: height,
        videoWidth: width,
        chunks: item.chunks,
        border: 5,
      });
      // TODO
      const chunks = item.chunks.map((chunk) => {
        const chunkCopy = { ...chunk };
        if (shiftX > shiftY) {
          chunkCopy.width = chunk.width - shiftX;
        } else if (shiftY) {
          chunkCopy.height = chunk.width - shiftY;
        }
        return chunkCopy;
      });
      _videos.push({
        src: '',
        id,
        ref: createRef(),
        x: 1,
        y: 0,
        w: 640,
        h: 480,
      });
    });
    setVideos(_videos);
  }, [episodes, dirName, request, token, width, height]);

  /**
   * Set on load metadata
   */
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    videos.forEach((item) => {
      const { current } = item.ref;
      const { current: canvas } = canvasRef;
      if (current && canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          current.onloadedmetadata = () => {
            current.play();
          };
          current.onplay = () => {
            intervals.push(
              setInterval(() => {
                if (!current.paused && !current.ended) {
                  requestAnimationFrame(() => {
                    ctx.drawImage(current, item.x, item.y, item.w, item.h);
                  });
                }
              }, 1000 / 30)
            );
          };
        } else {
          log('error', 'Canvas context is missing', { ctx });
        }
      } else {
        log('error', 'Current video is missing', { item });
      }
    });
    return () => {
      intervals.forEach((interval) => {
        clearInterval(interval);
      });
    };
  }, [videos, canvasRef]);

  return { videos };
};
