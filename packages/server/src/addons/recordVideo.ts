/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: record.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import * as werift from 'werift';
import { CancelablePromise } from 'cancelable-promise';
// import FFmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { PassThrough } from 'stream';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import { v4 } from 'uuid';
import { HEADLESS, VIEWPORT, APP_URL } from '../utils/constants';
import { ErrorCode, MessageType, SendMessageArgs, RECORD_VIDEO_NAME } from '../types/interfaces';
import DB from '../core/db';
import { getLocale, log } from '../utils/lib';
import Settings from './settings';
import RTC from '../core/rtc';

class RecordVideo extends DB {
  public settings: Settings;

  private dirPath: Record<string, string> = {};

  public intervals: Record<string, NodeJS.Timer> = {};

  public mediaRecorders: Record<string, Record<string, werift.MediaRecorder>> = {};

  public startTimes: Record<string, Record<string, number>> = {};

  public videoSettings: Record<string, Record<string, { width: number; height: number }>> = {};

  public times: Record<string, number> = {};

  private rtc: RTC;

  constructor({ settings: _settings, rtc: _rtc }: { settings: Settings; rtc: RTC }) {
    super();
    this.settings = _settings;
    this.rtc = _rtc;
    this.rtc.onChangeVideoTrack = ({ roomId, target, command: _command }) => {
      if (!this.times[roomId]) {
        return;
      }
      const mediaRecorderId = this.getMediaRecorderId(target, this.startTimes[roomId][target]);
      const time = parseInt(`${this.times[roomId]}`, 10);
      this.stopStreamRecord({
        roomId,
        userId: target,
        pathStr: this.mediaRecorders[roomId][mediaRecorderId].path,
        time,
      });
      this.startTimes[roomId][target] = time;
      this.startStreamRecord({ roomId, userId: target, time });
    };
  }

  private getConnId({ roomId, userId }: { roomId: string | number; userId: string | number }) {
    let connId = '';
    const peers = Object.keys(this.rtc.streams[roomId]);
    peers.forEach((item) => {
      const peer = item.split(this.rtc.delimiter);
      if (peer[0] === userId.toString() && peer[1] === '0') {
        // eslint-disable-next-line prefer-destructuring
        connId = peer[2];
      }
    });
    if (connId === '') {
      log('error', 'Conn id is missing', {
        roomId,
        userId,
        keys: this.rtc.getKeysStreams(roomId),
      });
    }
    return connId;
  }

  public getVideoSettingsHandler({
    id,
    data: { userId, width, height },
  }: SendMessageArgs<MessageType.GET_VIDEO_SETTINGS>) {
    if (!this.videoSettings[id]) {
      this.videoSettings[id] = {};
    }
    this.videoSettings[id][userId] = { width, height };
  }

  private changeEndTime({
    pathStr,
    time,
    roomId,
  }: {
    pathStr: string;
    time: number;
    roomId: string | number;
  }) {
    const fileName = pathStr.match(/\/\d+_0_[a-zA-Z0-9\\-]+.webm/);
    const cleanFileName = fileName ? fileName[0].replace(/\//, '').replace('.webm', '') : '';
    const fileNames = cleanFileName.split(this.rtc.delimiter);
    const newFileName = `${fileNames[0]}_${time}_${fileNames[2]}.webm`;
    fs.renameSync(pathStr, path.resolve(this.dirPath[roomId], newFileName));
  }

  private stopStreamRecord({
    roomId,
    userId,
    pathStr,
    time,
  }: {
    roomId: string | number;
    userId: string | number;
    pathStr: string;
    time: number;
  }) {
    const recorderId = this.getMediaRecorderId(userId, this.startTimes[roomId][userId]);
    this.mediaRecorders[roomId][recorderId].stop().then(() => {
      setTimeout(() => {
        this.changeEndTime({
          pathStr,
          time,
          roomId,
        });
        delete this.mediaRecorders[roomId][recorderId];
      }, 1000);
    });
  }

  private checkIsMuted({ userId, roomId }: { userId: string | number; roomId: string | number }) {
    const muted = this.rtc.muteds[roomId].find((item) => item === userId);
    const adminMuted = this.rtc.adminMuteds[roomId].find((item) => item === userId);
    return muted !== undefined || adminMuted !== undefined;
  }

  private checkVideoPlayed({
    userId,
    roomId,
  }: {
    userId: string | number;
    roomId: string | number;
  }) {
    const played = this.rtc.offVideo[roomId].find((item) => item === userId);
    return played === undefined;
  }

  private getMediaRecorderId(userId: string | number, startTime: number) {
    return `${userId}${this.rtc.delimiter}${startTime}`;
  }

  private startStreamRecord({
    roomId,
    userId,
    time,
  }: {
    roomId: string | number;
    userId: string | number;
    time: number;
  }) {
    const connId = this.getConnId({ roomId, userId });
    const peerId = this.rtc.getPeerId(userId, 0, connId);
    const { width, height } = this.videoSettings[roomId][userId];
    const _path = path.resolve(this.dirPath[roomId], `${time}_0_${connId}.webm`);
    const mediaRecorderId = this.getMediaRecorderId(userId, time);
    this.mediaRecorders[roomId][mediaRecorderId] = new werift.MediaRecorder([], _path, {
      width,
      height,
    });
    this.rtc.streams[roomId][peerId].forEach((item) => {
      this.mediaRecorders[roomId][mediaRecorderId].addTrack(item);
    });
    this.mediaRecorders[roomId][mediaRecorderId].start();
  }

  public async handleVideoRecord(args: SendMessageArgs<MessageType.GET_RECORD>) {
    const {
      id,
      data: { command, userId },
    } = args;
    if (!this.mediaRecorders[id]) {
      this.mediaRecorders[id] = {};
    }
    switch (command) {
      case 'start':
        this.times[id] = 0;
        this.intervals[id] = setInterval(() => {
          this.times[id]++;
          this.settings.sendMessage({
            msg: {
              type: MessageType.SET_RECORDING,
              id: userId,
              connId: '',
              data: {
                time: this.times[id],
                command,
              },
            },
            roomId: id,
          });
        }, 1000);
        this.dirPath[id] = path.resolve(__dirname, `../../rec/${new Date().getTime()}-${id}`);
        fs.mkdirSync(this.dirPath[id]);
        if (!this.startTimes[id]) {
          this.startTimes[id] = {};
        }

        this.startTimes[id][userId] = 0;
        this.startStreamRecord({ roomId: id, userId, time: 0 });
        break;
      case 'stop':
        clearInterval(this.intervals[id]);
        this.settings.sendMessage({
          msg: {
            type: MessageType.SET_RECORDING,
            id: userId,
            connId: '',
            data: {
              time: this.times[id],
              command,
            },
          },
          roomId: id,
        });
        this.stopStreamRecord({
          roomId: id,
          userId,
          pathStr:
            this.mediaRecorders[id][this.getMediaRecorderId(userId, this.startTimes[id][userId])]
              .path,
          time: this.times[id],
        });
        delete this.times[id];
        delete this.startTimes[id];
        delete this.mediaRecorders[id];
        break;
      default:
    }
  }
}
export default RecordVideo;
