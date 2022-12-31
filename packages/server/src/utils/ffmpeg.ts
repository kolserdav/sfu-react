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

interface VideoChunk {
  id: string;
  start: number;
  end: number;
  video: boolean;
  audio: boolean;
  absPath: string;
}

class Ffmpeg {
  private rtc: RTC;

  private videoSrc: string;

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
  }

  public async createVideo() {
    const dir = fs.readdirSync(this.videoSrc);
    // TODO create args
    const chunks = this.createVideoChunks({ dir });
    const inputArgs = this.createInputArguments({ chunks });
    const filterComplexArgs = this.createFilterComplexArguments({ chunks });
    console.log(inputArgs.concat(filterComplexArgs), chunks);
    // await this.runFfmpegCommand(['--help']);
  }

  private createVideoChunks({ dir }: { dir: string[] }) {
    const chunks: VideoChunk[] = [];
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

  private createInputArguments({ chunks }: { chunks: VideoChunk[] }) {
    const args: string[] = [];
    chunks.forEach((item) => {
      args.push(this.inputOption);
      args.push(item.absPath);
    });
    return args;
  }

  private createFilterComplexArguments({ chunks }: { chunks: VideoChunk[] }) {
    const args = [this.filterComplexOption];
    chunks.forEach((item) => {
      //
    });
    return args;
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
