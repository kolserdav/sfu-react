import fs from 'fs';
import { ServerResponse, IncomingMessage } from 'http';
import path from 'path';
import { DELIMITER, EXT_WEBM } from '../types/interfaces';
import { TMP_REGEX, VIDEO_REGEX, WEBM_REGEX } from '../utils/constants';
import { getVideoPath, log } from '../utils/lib';
import DB from './db';

interface ServerHandlerProps {
  isDefaultAuth: boolean;
  res: ServerResponse;
  req: IncomingMessage;
  unitId: string;
  url: string;
}

class Http extends DB {
  private cloudPath: string;

  constructor({ prisma, cloudPath }: { prisma: DB['prisma']; cloudPath: string }) {
    super({ prisma });
    this.cloudPath = cloudPath;
  }

  public async getVideoHandler({ isDefaultAuth, res, unitId, url }: ServerHandlerProps) {
    const id = url.replace(VIDEO_REGEX, '').replace(new RegExp(`${EXT_WEBM}$`), '');
    const video = await this.videoFindFirst({
      where: {
        id,
      },
      include: {
        Room: {
          select: {
            authorId: true,
          },
        },
      },
    });
    if (!video) {
      res.writeHead(video === undefined ? 500 : 404);
      res.end();
      return;
    }
    // Check author
    if (unitId !== video.Room.authorId && !isDefaultAuth) {
      res.writeHead(401);
      res.end();
      return;
    }

    const videoPath = getVideoPath({
      cloudPath: this.cloudPath,
      roomId: video.roomId,
      name: video.name,
    });
    const stream = fs.createReadStream(videoPath);
    res.writeHead(200, { 'Content-Type': 'video/webm' });
    stream.pipe(res);
  }

  public async getTmpHandler({ res, url, unitId, isDefaultAuth, req }: ServerHandlerProps) {
    const urlArr = url.replace(TMP_REGEX, '').split(DELIMITER);
    const id = urlArr[0];

    const room = await this.roomFindFirst({
      where: { id },
    });
    if (!room) {
      res.writeHead(room === undefined ? 500 : 404);
      res.end();
      return;
    }

    // Check author
    if (unitId !== room.authorId && !isDefaultAuth) {
      res.writeHead(401);
      res.end();
      return;
    }

    const isWebm = WEBM_REGEX.test(url);
    if (isWebm) {
      const stream = fs.createReadStream(path.resolve(this.cloudPath, `./${url}`));
      res.writeHead(200, { 'Content-Type': 'video/webm' });
      stream.pipe(res);
    } else {
      const dir = await new Promise<1 | string[]>((resolve) => {
        fs.readdir(path.resolve(this.cloudPath, `./${url}`), (err, data) => {
          if (err) {
            log('error', 'Error read tmp dir', {
              err,
              url,
              headers: req.headers,
              unitId,
              isDefaultAuth,
            });
            resolve(1);
          }
          resolve(data);
        });
      });

      if (dir === 1) {
        res.writeHead(410);
        res.end();
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(dir));
      res.end();
    }
  }
}

export default Http;
