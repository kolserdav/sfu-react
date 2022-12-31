import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import RTC from '../core/rtc';

// eslint-disable-next-line import/first
import { log } from './lib';
import WS from '../core/ws';
import DB from '../core/db';
import { EXT_WEBM } from './constants';

// FIXME remove it
process.env.LOG_LEVEL = '0';

interface Chunk {
  id: string;
  start: number;
  end: number;
  video: boolean;
  audio: boolean;
  absPath: string;
}

type ChunkPart = Chunk & { from: number; to: number };

interface Episode {
  start: number;
  end: number;
  chunks: ChunkPart[];
}

class Ffmpeg {
  private rtc: RTC;

  private videoSrc: string;

  private chunks: Chunk[];

  private readonly inputOption = '-i';

  private readonly filterComplexOption = '-filter_complex';

  private readonly vstackInputs = 'vstack=inputs=';

  private readonly hstackInputs = 'hstack=inputs=';

  private readonly amergeInputs = 'amerge=inputs=';

  private readonly startDuration = 'tpad=start_mode=clone:start_duration=';

  private readonly stopDuration = 'tpad=stop_mode=clone:stop_duration=';

  constructor({ rtc, videoSrc }: { rtc: RTC; videoSrc: string }) {
    this.rtc = rtc;
    this.videoSrc = videoSrc;
    const dir = fs.readdirSync(this.videoSrc);
    this.chunks = this.createVideoChunks({ dir });
  }

  public async createVideo() {
    const inputArgs = this.createInputArguments();
    const filterComplexArgs = this.createFilterComplexArguments();
    // console.log(inputArgs.concat(filterComplexArgs), this.chunks);
    // await this.runFfmpegCommand(['--help']);
  }

  private createVideoChunks({ dir }: { dir: string[] }) {
    const chunks: Chunk[] = [];
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
      });
    });
    return chunks.sort((a, b) => {
      if (a.start < b.start) {
        return -1;
      }
      if (a.start === b.start) {
        if (a.end < b.end) {
          return -1;
        }
      }
      return 1;
    });
  }

  private createInputArguments() {
    const args: string[] = [];
    this.chunks.forEach((item) => {
      args.push(this.inputOption);
      args.push(item.absPath);
    });
    return args;
  }

  private createFilterComplexArguments() {
    const args = [this.filterComplexOption];
    const episodes = this.createEpisodes();
    episodes.forEach((item) => {
      console.log(item);
    });
    this.chunks.forEach((item) => {
      //
    });
    return args;
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
        const chunkPart: ChunkPart[] = oldChunks.map((item) => {
          const _item: ChunkPart = { ...item } as any;
          _item.from = from || 0;
          _item.to = index;
          return _item;
        });

        episodes.push({
          start: from,
          end: index,
          chunks: chunkPart,
        });
        from = index;
      }
      oldChunks = chunks;
    });
    return episodes;
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

  private async runFfmpegCommand(args: string[]) {
    const ffmpeg = spawn('ffmpeg', args);
    return new Promise((resolve) => {
      ffmpeg.stdout.on('data', (d) => {
        log('log', 'stdout', d.toString());
      });
      ffmpeg.stderr.on('data', (d) => {
        log('info', 'stderr', d.toString());
      });
      ffmpeg.stdout.on('end', () => {
        log('log', 'Run ffmpeg command stdout end', { args });
      });
      ffmpeg.on('exit', (code) => {
        log('info', 'Run ffmpeg command exit with code', code);
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
