import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

// FIXME remove it
process.env.LOG_LEVEL = '0';

// eslint-disable-next-line import/first
import { log } from '../../utils/lib';

class Ffmpeg {
  public async createVideo({ videoSrc }: { videoSrc: string }) {
    const dir = fs.readdirSync(videoSrc);
    // TODO create args
    await this.runFfmpegCommand(['--help']);
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

new Ffmpeg().createVideo({
  videoSrc: '/home/kol/Projects/werift-sfu-react/packages/server/rec/1672300295858-1672296192017',
});
