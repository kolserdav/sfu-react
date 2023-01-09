import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import RTC from '../core/rtc';

// eslint-disable-next-line import/first
import { createRandHash, log } from './lib';
import WS from '../core/ws';
import DB from '../core/db';
import { EXT_WEBM } from './constants';

// FIXME remove it
process.env.LOG_LEVEL = '0';
process.env.NODE_ENV = 'development';

interface Chunk {
  index: number;
  id: string;
  start: number;
  end: number;
  video: boolean;
  audio: boolean;
  absPath: string;
  map: string;
}

interface Episode {
  start: number;
  end: number;
  map: string;
  chunks: Chunk[];
}

class Ffmpeg {
  private rtc: RTC;

  private videoSrc: string;

  private chunks: Chunk[];

  private episodes: Episode[] = [];

  private readonly mapLength = 6;

  private readonly forceOption = '-y';

  private readonly inputOption = '-i';

  private readonly filterComplexOption = '-filter_complex';

  private readonly mapOption = '-map';

  private readonly eol = ';';

  private readonly backgroundInput = '0:v';

  private backgroundImagePath = '/home/kol/Projects/werift-sfu-react/tmp/1png.png';

  private readonly vstackInputs = 'vstack=inputs=';

  // eslint-disable-next-line class-methods-use-this
  private readonly hstack = ({ inputs }: { inputs: number }) => `hstack=inputs=${inputs}`;

  private readonly amergeInputs = 'amerge=inputs=';

  private readonly overlay = 'overlay=(W-w)/2:(H-h)/2';

  // eslint-disable-next-line class-methods-use-this
  private readonly pad = ({ x, y }: { x: number; y: number }) =>
    `format=rgba,pad=width=iw+${x}:height=ih+${y}:x=iw/2:y=ih/2:color=#00000000`;

  // eslint-disable-next-line class-methods-use-this
  private readonly concat = ({ n, v, a }: { n: number; v: number; a: number }) =>
    `concat=n=${n}:v=${v}:a=${a}`;

  // eslint-disable-next-line class-methods-use-this
  private readonly startDuration = ({ start, duration }: { start: number; duration: number }) =>
    `trim=start=${start}:duration=${duration},setpts=PTS-STARTPTS`;

  constructor({ rtc, videoSrc }: { rtc: RTC; videoSrc: string }) {
    this.rtc = rtc;
    this.videoSrc = videoSrc;
    const dir = fs.readdirSync(this.videoSrc);
    this.chunks = this.createVideoChunks({ dir });
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

  public async createVideo() {
    const inputArgs = this.createInputArguments();
    const filterComplexArgs = this.createFilterComplexArguments();
    const args = inputArgs.concat(filterComplexArgs);
    args.push(`${this.videoSrc}${EXT_WEBM}`);
    const r = await this.runFFmpegCommand(args);
    console.log(r);
  }

  private createVideoChunks({ dir }: { dir: string[] }): Chunk[] {
    const chunks: Omit<Chunk, 'index'>[] = [];
    dir.forEach((item) => {
      const peer = item.replace(EXT_WEBM, '').split(this.rtc.delimiter);
      const start = parseInt(peer[0], 10);
      const end = parseInt(peer[1], 10);
      const id = peer[2];
      const video = peer[3] === '1';
      const audio = peer[4] === '1';
      chunks.push({
        id,
        start,
        end,
        video,
        audio,
        absPath: path.resolve(this.videoSrc, item),
        map: '',
      });
    });
    return chunks
      .sort((a, b) => {
        if (a.start < b.start) {
          return -1;
        }
        if (a.start === b.start) {
          if (a.end < b.end) {
            return -1;
          }
        }
        return 1;
      })
      .map((item, index) => {
        const _item: Chunk = { ...item } as any;
        _item.index = index + 1;
        return _item;
      });
  }

  private createInputArguments() {
    const args: string[] = [this.forceOption, this.inputOption, this.backgroundImagePath];
    this.chunks.forEach((item) => {
      args.push(this.inputOption);
      args.push(item.absPath);
    });
    return args;
  }

  // eslint-disable-next-line class-methods-use-this
  private createMapArg(map: string | number) {
    return `[${map}]`;
  }

  private getArg({ chunk, dest }: { chunk: Chunk; dest: 'a' | 'v' }) {
    return chunk.map !== ''
      ? this.createMapArg(chunk.map)
      : this.createMapArg(`${chunk.index}:${dest}`);
  }

  // eslint-disable-next-line class-methods-use-this
  private joinFilterComplexArgs(args: string[]) {
    return `"${args.join('').replace(/;$/, '')}"`;
  }

  private createFilterComplexArguments() {
    const args: string[] = [];
    const _episodes = this.createEpisodes();
    this.episodes = _episodes.map((episode) => {
      const episodeCopy: Episode = { ...episode } as any;
      // Set start and duration
      let chunks = episode.chunks.map((chunk) => {
        const chunkCopy: Chunk = { ...chunk } as any;
        if (chunk.start !== episode.start || chunk.end !== episode.end) {
          const start = episode.start - chunk.start;
          const duration = episode.end - start;
          chunkCopy.map = createRandHash(this.mapLength);
          args.push(
            this.getFilterComplexArgument({
              args: this.createMapArg(chunk.index),
              value: this.startDuration({ start, duration }),
              map: this.createMapArg(chunkCopy.map),
            })
          );
        } else {
          chunkCopy.map = '';
        }
        return chunkCopy;
      });
      // Set video paddings
      chunks = chunks.map((chunk) => {
        const chunkCopy = { ...chunk };
        chunkCopy.map = createRandHash(this.mapLength);
        if (chunk.video) {
          const arg = this.getArg({ chunk, dest: 'v' });
          // TODO calc x and y
          args.push(
            this.getFilterComplexArgument({
              args: arg,
              value: this.pad({ x: 100, y: 50 }),
              map: this.createMapArg(chunkCopy.map),
            })
          );
        }
        return chunkCopy;
      });
      // Set video stacks
      const { videoCount } = this.getCountVideos(episode.chunks);
      const map = createRandHash(this.mapLength);
      if (videoCount === 2 || videoCount === 3) {
        let arg = '';
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
      }
      // TODO videos.length === 4
      episodeCopy.chunks = chunks;
      return episodeCopy;
    });
    // Set overlay
    this.episodes = this.episodes.map((episode) => {
      const episdeCopy = { ...episode };
      const uMaps = this.getUniqueMaps(episode);
      const map = createRandHash(this.mapLength);
      uMaps.forEach((uMap) => {
        args.push(
          this.getFilterComplexArgument({
            args: `${this.createMapArg(this.backgroundInput)}${this.createMapArg(uMap)}`,
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
    let arg = '';
    this.episodes = this.episodes.map((episode) => {
      const episodeCopy = { ...episode };
      arg += this.createMapArg(episode.map);
      episodeCopy.map = concatMap;
      return episodeCopy;
    });
    args.push(
      this.getFilterComplexArgument({
        args: arg,
        value: this.concat({
          n: this.episodes.length,
          v: 1,
          a: 0,
        }),
        map: this.createMapArg(concatMap),
      })
    );
    const _args = [this.filterComplexOption, this.joinFilterComplexArgs(args)];
    return _args.concat(this.getMap());
  }

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

  private getMap() {
    const maps: string[] = [];
    this.episodes.forEach((item) => {
      if (item.map) {
        const map = `"[${item.map}]"`;
        if (maps.indexOf(map) === -1) {
          maps.push(this.mapOption);
          maps.push(map);
        }
        return;
      }
      const uMaps = this.getUniqueMaps(item);
      uMaps.forEach((_item) => {
        maps.push(this.mapOption);
        maps.push(`"${this.createMapArg(_item)}"`);
      });
    });
    return maps;
  }

  private getCountVideos(chunks: Chunk[]) {
    let videoCount = 0;
    let audioCount = 0;
    chunks.forEach((item) => {
      if (item.video) {
        videoCount++;
      }
      if (item.audio) {
        audioCount++;
      }
    });
    return {
      videoCount,
      audioCount,
    };
  }

  private createEpisodes() {
    const episodes: Episode[] = [];
    const time = this.getVideoTime();
    let oldChunks: Chunk[] = [];
    let from: number | undefined;
    new Array(time).fill('').forEach((_, index) => {
      if (from === undefined) {
        from = index;
      }
      const chunks: Chunk[] = [];
      this.chunks.every((item) => {
        if (item.start > index || item.end < index) {
          return false;
        }
        if (item.start <= index && item.end > index) {
          chunks.push(item);
        }
        return true;
      });
      oldChunks = oldChunks.length === 0 ? chunks : oldChunks;
      if (!this.isEqual(chunks, oldChunks)) {
        const chunkPart: Chunk[] = oldChunks.map((item) => {
          const _item: Chunk = { ...item } as any;
          _item.map = createRandHash(this.mapLength);
          return _item;
        });

        episodes.push({
          start: from,
          end: index,
          map: '',
          chunks: chunkPart,
        });
        from = index;
      }
      oldChunks = chunks;
    });
    return episodes.map((item, index) => {
      const _item = { ...item };
      if (!episodes[index + 1]) {
        _item.end = time;
      }
      return _item;
    });
  }

  private isEqual(a: any[], b: any[]) {
    let check = true;
    if (a.length !== b.length) {
      return false;
    }
    a.every((item, index) => {
      const aKeys = Object.keys(item);
      aKeys.every((_item) => {
        if (item[_item] !== b[index]?.[_item]) {
          check = false;
          return false;
        }
        return true;
      });
      return check;
    });
    return check;
  }

  private getVideoTime() {
    const min = this.chunks[0]?.start || 0;
    let max = 0;
    this.chunks.forEach((item) => {
      if (item.end > max) {
        max = item.end;
      }
    });
    return max - min;
  }

  private async runFFmpegCommand(args: string[]) {
    return new Promise((resolve) => {
      const command = `${ffmpeg} ${args.join(' ')}`;
      log('info', 'Run command', command);
      const fC = exec(command, { env: process.env }, (error) => {
        if (error) {
          log('error', 'FFmpeg command error', error);
          resolve(error.code);
        }
      });
      fC.stdout?.on('data', (d) => {
        log('log', 'stdout', d);
      });
      fC.stderr?.on('data', (d) => {
        log('info', 'stderr', d);
      });
      fC.on('exit', (code) => {
        log('info', 'FFmpeg command exit with code', code);
        resolve(code);
      });
    });
  }
}

export default Ffmpeg;

new Ffmpeg({
  rtc: new RTC({ ws: new WS({ db: new DB() }) }),
  videoSrc: '/home/kol/Projects/werift-sfu-react/packages/server/rec/1672300295858-1672296192017',
}).createVideo();
