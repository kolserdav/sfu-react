/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: ffmpeg.ts
 * Author: Sergey Kolmiller
 * Email: <kolserdav@uyem.ru>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 02 2023 23:56:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { differenceInSeconds } from 'date-fns';
import ffmpeg from 'ffmpeg-static';

const isDev = process.env.FFMPEG_DEV === 'true';

if (isDev) {
  process.env.LOG_LEVEL = '1';
  process.env.NODE_ENV = 'development';
}

// eslint-disable-next-line import/first
import { createRandHash, getRoomDirPath, log } from './lib';
// eslint-disable-next-line import/first
import { RECORD_HEIGHT_DEFAULT, RECORD_WIDTH_DEFAULT } from './constants';
// eslint-disable-next-line import/first
import {
  Chunk,
  createEpisodes,
  createVideoChunks,
  Episode,
  EXT_WEBM,
  getCountVideos,
  getVideoShifts,
} from '../types/interfaces';

// eslint-disable-next-line no-unused-vars
type LoadingCallback = (procent: number) => void;

class FFmpeg {
  private dirPath: string;

  private time = 0;

  private chunks: Chunk[];

  private episodes: Episode[] = [];

  private roomId: string;

  private readonly border = 5;

  private readonly videoWidth = 1280;

  private readonly videoHeight = 720;

  private readonly mapLength = 6;

  private readonly delimiter = '_';

  private readonly forceOption = '-y';

  private readonly inputOption = '-i';

  private readonly filterComplexOption = '-filter_complex';

  private readonly mapOption = '-map';

  private readonly eol = ';';

  private readonly backgroundInput = '0:v';

  private backgroundImagePath: string | null;

  // eslint-disable-next-line class-methods-use-this
  private readonly vstack = ({ inputs }: { inputs: number }) => `vstack=inputs=${inputs}`;

  // eslint-disable-next-line class-methods-use-this
  private readonly hstack = ({ inputs }: { inputs: number }) => `hstack=inputs=${inputs}`;

  // eslint-disable-next-line class-methods-use-this
  private readonly amerge = ({ count }: { count: number }) => `amerge=inputs=${count}`;

  private readonly overlay = 'overlay=(W-w)/2:(H-h)/2';

  // eslint-disable-next-line class-methods-use-this
  private readonly pad = ({ x, y }: { x: number; y: number }) =>
    `format=rgba,pad=width=iw+${x}:height=ih+${y}:x=iw/2:y=ih/2:color=#00000000`;

  // eslint-disable-next-line class-methods-use-this
  private readonly concat = ({ n, v, a }: { n: number; v: number; a: number }) =>
    `concat=n=${n}:v=${v}:a=${a}`;

  // eslint-disable-next-line class-methods-use-this
  private readonly trim = ({ start, duration }: { start: number; duration: number }) =>
    `trim=start=${start}:duration=${duration},setpts=PTS-STARTPTS`;

  // eslint-disable-next-line class-methods-use-this
  private readonly atrim = ({ start, duration }: { start: number; duration: number }) =>
    `atrim=start=${start}:duration=${duration},asetpts=PTS-STARTPTS`;

  // eslint-disable-next-line class-methods-use-this
  private readonly scale = ({ w, h }: { w: number; h: number }) =>
    `scale=w=${w}:h=${h}:force_original_aspect_ratio=decrease`;

  // eslint-disable-next-line class-methods-use-this
  private readonly color = ({ w, h }: { w: number; h: number }) => `color=c=black:s=${w}x${h}`;

  constructor({
    dirPath,
    dir,
    roomId,
    backgroundImagePath,
  }: {
    dirPath: string;
    dir: string[];
    roomId: string;
    backgroundImagePath: string | null;
  }) {
    this.dirPath = dirPath;
    this.backgroundImagePath = backgroundImagePath;
    this.roomId = roomId;
    this.chunks = createVideoChunks({ dir, dirPath, indexShift: backgroundImagePath !== null });
  }

  private getFilterComplexArgument({
    args,
    value,
    map,
  }: {
    args: string;
    value: string;
    map: string;
  }) {
    return `${args}${value}${map}${this.eol}`;
  }

  public async createVideo({ loading }: { loading: LoadingCallback }) {
    const inputArgs = this.createInputArguments();
    const filterComplexArgs = this.createFilterComplexArguments();
    const args = inputArgs.concat(filterComplexArgs);
    const videosDirPath = this.getVideosDirPath();
    const roomDir = getRoomDirPath({ videosDirPath, roomId: this.roomId });
    if (!fs.existsSync(roomDir)) {
      fs.mkdirSync(roomDir);
    }
    const name = this.getVideoName({ videosDirPath });
    const src = path.resolve(roomDir, `./${name}`);
    args.push(src);
    // process.exit(0);
    const errorCode = await this.runFFmpegCommand(args, loading);
    return {
      errorCode,
      name,
      time: this.time,
    };
  }

  private getVideoName = ({ videosDirPath }: { videosDirPath: string }) =>
    `${this.dirPath
      .replace(videosDirPath, '')
      .replace(new RegExp(`^${this.roomId}${this.delimiter}`), '')}${EXT_WEBM}`;

  private getVideosDirPath = () => this.dirPath.replace(/[a-z0-9A-Z-_]+$/, '');

  private createInputArguments() {
    let args: string[] = [this.forceOption];
    if (this.backgroundImagePath) {
      args = args.concat([this.inputOption, this.backgroundImagePath]);
    }
    this.chunks.forEach((item) => {
      args.push(this.inputOption);
      args.push(item.fullPath);
    });
    return args;
  }

  // eslint-disable-next-line class-methods-use-this
  private createMapArg(map: string | number) {
    return `[${map}]`;
  }

  private getArg({ chunk, dest }: { chunk: Chunk; dest: 'a' | 'v' }) {
    const map = dest === 'a' ? chunk.mapA : chunk.map;
    return map !== '' ? this.createMapArg(map) : this.createMapArg(`${chunk.index}:${dest}`);
  }

  // eslint-disable-next-line class-methods-use-this
  private joinFilterComplexArgs(args: string[]) {
    return `"${args.join('').replace(/;$/, '')}"`;
  }

  private createFilterComplexArguments() {
    const args: string[] = [];
    const _episodes = createEpisodes({ chunks: this.chunks });
    let withAudio = false;
    this.episodes = _episodes.map((episode, index) => {
      console.log(episode);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const episodeCopy: Episode = { ...episode } as any;
      // Set start and duration
      let chunks: Chunk[] = episode.chunks.map((chunk) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const chunkCopy: Chunk = { ...chunk } as any;
        if (chunk.video) {
          chunkCopy.video = true;
          if (!episode.video) {
            episodeCopy.video = true;
          }
        }
        if (chunk.audio) {
          chunkCopy.audio = true;
          withAudio = true;
          if (!episode.audio) {
            episodeCopy.audio = true;
          }
        }
        if (chunk.start !== episode.start || chunk.end !== episode.end) {
          const start = index === 0 ? 0 : Math.abs(chunk.start - episode.start);
          const duration = episode.end - episode.start;
          if (chunk.video) {
            chunkCopy.map = createRandHash(this.mapLength);
            args.push(
              this.getFilterComplexArgument({
                args: this.createMapArg(`${chunk.index}:v`),
                value: this.trim({ start, duration }),
                map: this.createMapArg(chunkCopy.map),
              })
            );
          }
          if (chunk.audio) {
            chunkCopy.mapA = createRandHash(this.mapLength);
            args.push(
              this.getFilterComplexArgument({
                args: this.createMapArg(`${chunk.index}:a`),
                value: this.atrim({ start, duration }),
                map: this.createMapArg(chunkCopy.mapA),
              })
            );
          }
        } else {
          chunkCopy.map = '';
          chunkCopy.mapA = '';
        }
        return chunkCopy;
      });
      // Set audio channels
      const mapA = createRandHash(this.mapLength);
      let arg = '';
      let audioCount = 0;
      chunks = chunks.map((chunk) => {
        const chunkCopy = { ...chunk };
        if (chunk.audio) {
          audioCount++;
          arg += this.getArg({ chunk, dest: 'a' });
          episodeCopy.mapA = mapA;
          return chunkCopy;
        }
        return chunk;
      });
      if (audioCount !== 0) {
        args.push(
          this.getFilterComplexArgument({
            args: arg,
            value: this.amerge({ count: audioCount }),
            map: this.createMapArg(mapA),
          })
        );
      }
      // Set video paddings
      const { videoCount } = getCountVideos(episode.chunks);
      const { x, y, shiftX, shiftY } = getVideoShifts({
        videoCount,
        chunks,
        videoHeight: this.videoHeight,
        videoWidth: this.videoWidth,
        border: this.border,
      });
      chunks = chunks.map((chunk) => {
        if (chunk.video) {
          const chunkCopy = { ...chunk };
          // Scale if not included in size
          let map = createRandHash(this.mapLength);
          if (shiftX > shiftY) {
            const newWidth = chunk.width - shiftX;
            args.push(
              this.getFilterComplexArgument({
                args: this.getArg({ chunk: chunkCopy, dest: 'v' }),
                value: this.scale({ w: newWidth, h: -1 }),
                map: this.createMapArg(map),
              })
            );
            chunkCopy.map = map;
          } else if (shiftY) {
            const newHeight = chunk.height - shiftY;
            args.push(
              this.getFilterComplexArgument({
                args: this.getArg({ chunk: chunkCopy, dest: 'v' }),
                value: this.scale({ w: -1, h: newHeight }),
                map: this.createMapArg(map),
              })
            );
            chunkCopy.map = map;
          }
          map = createRandHash(this.mapLength);
          args.push(
            this.getFilterComplexArgument({
              args: this.getArg({ chunk: chunkCopy, dest: 'v' }),
              value: this.pad({ x, y }),
              map: this.createMapArg(map),
            })
          );
          chunkCopy.map = map;
          return chunkCopy;
        }
        return chunk;
      });
      // Set video stacks
      let map = createRandHash(this.mapLength);
      if (videoCount === 2 || videoCount === 3) {
        arg = '';
        chunks = chunks.map((chunk) => {
          if (chunk.video) {
            const chunkCopy = { ...chunk };
            arg += this.getArg({ chunk, dest: 'v' });
            chunkCopy.map = map;
            return chunkCopy;
          }
          return chunk;
        });
        args.push(
          this.getFilterComplexArgument({
            args: arg,
            value: this.hstack({ inputs: videoCount }),
            map: this.createMapArg(map),
          })
        );
      } else if (videoCount === 4) {
        arg = '';
        let i = 0;
        chunks = chunks.map((chunk) => {
          if (chunk.video) {
            i++;
            if (i <= 2) {
              const chunkCopy = { ...chunk };
              arg += this.getArg({ chunk, dest: 'v' });
              chunkCopy.map = map;
              return chunkCopy;
            }
          }
          return chunk;
        });
        args.push(
          this.getFilterComplexArgument({
            args: arg,
            value: this.hstack({ inputs: 2 }),
            map: this.createMapArg(map),
          })
        );
        map = createRandHash(this.mapLength);
        arg = '';
        i = 0;
        chunks = chunks.map((chunk) => {
          if (chunk.video) {
            i++;
            if (i > 2) {
              const chunkCopy = { ...chunk };
              arg += this.getArg({ chunk, dest: 'v' });
              chunkCopy.map = map;
              return chunkCopy;
            }
          }
          return chunk;
        });
        args.push(
          this.getFilterComplexArgument({
            args: arg,
            value: this.hstack({ inputs: 2 }),
            map: this.createMapArg(map),
          })
        );
        map = createRandHash(this.mapLength);
        episodeCopy.chunks = chunks;
        const uMaps = this.getUniqueMaps(episodeCopy);
        arg = '';
        uMaps.forEach((uMap) => {
          arg += this.createMapArg(uMap);
        });
        chunks = chunks.map((chunk) => {
          const chunkCopy = { ...chunk };
          chunkCopy.map = map;
          return chunkCopy;
        });
        args.push(
          this.getFilterComplexArgument({
            args: arg,
            value: this.vstack({ inputs: 2 }),
            map: this.createMapArg(map),
          })
        );
      }
      episodeCopy.chunks = chunks;
      return episodeCopy;
    });
    // Set overlay
    this.episodes = this.episodes.map((episode) => {
      const episdeCopy = { ...episode };
      const uMaps = this.getUniqueMaps(episode);
      const map = createRandHash(this.mapLength);
      const emptyMap = createRandHash(this.mapLength);
      const isEmpty = uMaps.length === 1 && uMaps[0] === '';
      if (isEmpty) {
        args.push(
          this.getFilterComplexArgument({
            args: this.createMapArg(`${episode.chunks[0].index}:v`),
            value: this.scale({ w: RECORD_WIDTH_DEFAULT, h: RECORD_HEIGHT_DEFAULT }),
            map: this.createMapArg(emptyMap),
          })
        );
      }
      const trimMap = createRandHash(this.mapLength);
      if (!this.backgroundImagePath) {
        const colorMap = createRandHash(this.mapLength);
        args.push(
          this.getFilterComplexArgument({
            args: '',
            value: this.color({ w: this.videoWidth, h: this.videoHeight }),
            map: this.createMapArg(colorMap),
          })
        );
        const duration = episode.end - episode.start;
        args.push(
          this.getFilterComplexArgument({
            args: this.createMapArg(colorMap),
            value: this.trim({ start: episode.start, duration }),
            map: this.createMapArg(trimMap),
          })
        );
      }
      uMaps.forEach((uMap) => {
        args.push(
          this.getFilterComplexArgument({
            args: `${this.createMapArg(
              this.backgroundImagePath ? this.backgroundInput : trimMap
            )}${this.createMapArg(isEmpty ? emptyMap : uMap)}`,
            value: this.overlay,
            map: this.createMapArg(map),
          })
        );
      });
      episdeCopy.map = map;

      return episdeCopy;
    });

    // Set concat
    const concatMap = createRandHash(this.mapLength);
    const concatMapA = createRandHash(this.mapLength);
    let arg = '';
    this.episodes = this.episodes.map((episode) => {
      const episodeCopy = { ...episode };
      arg += `${this.createMapArg(episode.map)}${
        episode.mapA ? this.createMapArg(episode.mapA) : ''
      }`;
      episodeCopy.map = concatMap;
      episodeCopy.mapA = concatMapA;
      return episodeCopy;
    });
    args.push(
      this.getFilterComplexArgument({
        args: arg,
        value: this.concat({
          n: this.episodes.length,
          v: 1,
          a: withAudio ? 1 : 0,
        }),
        map: `${this.createMapArg(concatMap)}${withAudio ? this.createMapArg(concatMapA) : ''}`,
      })
    );
    const _args = [this.filterComplexOption, this.joinFilterComplexArgs(args)];
    return _args.concat(this.getMap(withAudio));
  }

  // eslint-disable-next-line class-methods-use-this
  private getUniqueMaps(episode: Episode) {
    const uMaps: string[] = [];
    episode.chunks.forEach((_item) => {
      const { map } = _item;
      if (uMaps.indexOf(map) === -1) {
        uMaps.push(map);
      }
    });
    return uMaps;
  }

  private getMap(withAudio: boolean) {
    const maps: string[] = [];
    this.episodes.forEach((item) => {
      if (item.map) {
        const map = `"${this.createMapArg(item.map)}"`;
        if (maps.indexOf(map) === -1) {
          maps.push(this.mapOption);
          maps.push(map);
        }
      }
      if (item.mapA && withAudio) {
        const mapA = `"${this.createMapArg(item.mapA)}"`;
        if (maps.indexOf(mapA) === -1) {
          maps.push(this.mapOption);
          maps.push(mapA);
        }
      }
    });
    return maps;
  }

  private parseTime(data: string) {
    const time = data.match(/time=\d{2}:\d{2}:\d{2}/);
    let result: number | null = null;
    if (time) {
      const _time = time[0].replace('time=', '');
      const t = _time.split(':');
      const d = differenceInSeconds(
        new Date(0, 0, 0, parseInt(t[0], 10), parseInt(t[1], 10), parseInt(t[2], 10)),
        new Date(0, 0, 0, 0, 0, 0)
      );
      const procents = Math.ceil(d / ((this.time - 1) / 100));
      result = procents < 100 ? procents : 100;
    }
    return result;
  }

  private async runFFmpegCommand(args: string[], loading: LoadingCallback) {
    return new Promise<number>((resolve) => {
      const command = `${ffmpeg} ${args.join(' ')}`;
      log('info', 'Run command', command);
      const fC = exec(command, { env: process.env }, (error) => {
        if (error) {
          log('error', 'FFmpeg command error', error);
          resolve(error.code || 0);
        }
      });
      fC.stdout?.on('data', (d) => {
        log('log', 'stdout', d);
      });
      fC.stderr?.on('data', (d) => {
        log('info', 'stderr', d);
        const time = this.parseTime(d);
        if (time) {
          loading(time);
        }
      });
      fC.on('exit', (code) => {
        log('info', 'FFmpeg command exit with code', code);
        resolve(code || 0);
      });
    });
  }
}

export default FFmpeg;

if (isDev) {
  const roomId = '1673340519949';
  const dirPath =
    '/home/kol/Projects/werift-sfu-react/packages/server/rec/videos/1673340519949_1673950253377';
  new FFmpeg({
    dirPath,
    dir: fs.readdirSync(dirPath),
    roomId,
    backgroundImagePath: null,
    //backgroundImagePath: '/home/kol/Projects/werift-sfu-react/tmp/1png.png',
  }).createVideo({
    loading: (time) => {
      // eslint-disable-next-line no-console
      console.log(time);
    },
  });
}
