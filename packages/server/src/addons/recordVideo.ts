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
// import FFmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { ErrorCode, MessageType, SendMessageArgs } from '../types/interfaces';
import DB from '../core/db';
import { getLocale, log } from '../utils/lib';
import * as ff from './lib/ffmpeg';
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
    this.setHandlers();
  }

  private setHandlers() {
    this.rtc.onChangeVideoTrack = ({ roomId, target }) => {
      if (!this.times[roomId]) {
        return;
      }

      const mediaRecorderId = this.getMediaRecorderId(
        target,
        this.startTimes[roomId]?.[target] || 0
      );
      const recorder = this.mediaRecorders[roomId][mediaRecorderId];
      const time = parseInt(`${this.times[roomId]}`, 10);
      if (recorder) {
        this.stopStreamRecord({
          roomId,
          userId: target,
          pathStr: recorder.path,
          time,
          eventName: 'on-change-video-track',
        });
      } else {
        log('info', 'Recorder is missing', {
          roomId,
          target,
          mediaRecorderId,
          recs: this.getMediaRecorderKeys(roomId),
        });
      }
      this.startStreamRecord({ roomId, userId: target, time, eventName: 'on-change-video-track' });
    };

    this.rtc.onChangeMute = this.rtc.onChangeVideoTrack;

    this.rtc.onRoomConnect = ({ roomId, userId }) => {
      if (!this.times[roomId]) {
        return;
      }
      const time = parseInt(`${this.times[roomId]}`, 10);
      this.startStreamRecord({ roomId, userId, time, eventName: 'on-room-connect' });
    };

    this.rtc.onRoomDisconnect = ({ roomId, userId }) => {
      if (!this.times[roomId]) {
        return;
      }
      const mediaRecorderId = this.getMediaRecorderId(
        userId,
        this.startTimes[roomId]?.[userId] || 0
      );
      const recorder = this.mediaRecorders[roomId][mediaRecorderId];
      if (!recorder) {
        return;
      }
      const time = parseInt(`${this.times[roomId]}`, 10);
      this.stopStreamRecord({
        roomId,
        userId,
        pathStr: recorder.path,
        time,
        eventName: 'on-room-disconnect',
      });
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
    const fileName = pathStr.match(/\/\d+_0_[a-zA-Z0-9_\\-]+.webm/);
    const cleanFileName = fileName ? fileName[0].replace(/\//, '').replace('.webm', '') : '';
    const fileNames = cleanFileName.split(this.rtc.delimiter);
    const ul = this.rtc.delimiter;
    const newFileName = `${fileNames[0]}${ul}${time}${ul}${fileNames[2]}${ul}${fileNames[3]}${ul}${fileNames[4]}.webm`;
    fs.renameSync(pathStr, path.resolve(this.dirPath[roomId], newFileName));
  }

  private stopStreamRecord({
    roomId,
    userId,
    pathStr,
    time,
    eventName,
  }: {
    roomId: string | number;
    userId: string | number;
    pathStr: string;
    time: number;
    eventName: string;
  }) {
    const recorderId = this.getMediaRecorderId(userId, this.startTimes[roomId][userId]);
    log('info', 'Stop stream record', { recorderId, roomId, pathStr, time, eventName });
    this.mediaRecorders[roomId][recorderId].stop().then(() => {
      setTimeout(() => {
        this.changeEndTime({
          pathStr,
          time,
          roomId,
        });
        if (this.mediaRecorders[roomId]?.[recorderId]) {
          delete this.mediaRecorders[roomId][recorderId];
        }
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

  private getMediaRecorderKeys(roomId: string | number) {
    return Object.keys(this.mediaRecorders[roomId]) || [];
  }

  private startStreamRecord({
    roomId,
    userId,
    time,
    eventName,
  }: {
    roomId: string | number;
    userId: string | number;
    time: number;
    eventName: string;
  }) {
    const videoPlayed = this.checkVideoPlayed({ roomId, userId });
    const audioPlayed = !this.checkIsMuted({ roomId, userId });
    if (!videoPlayed && !audioPlayed) {
      return;
    }
    const connId = this.getConnId({ roomId, userId });
    const peerId = this.rtc.getPeerId(userId, 0, connId);
    const { width, height } = this.videoSettings[roomId][userId];
    const ul = this.rtc.delimiter;
    const _path = path.resolve(
      this.dirPath[roomId],
      `${time}${ul}0${ul}${userId}${ul}${videoPlayed ? 1 : 0}${ul}${audioPlayed ? 1 : 0}.webm`
    );
    const recorderId = this.getMediaRecorderId(userId, time);
    log('info', 'Start stream record', { recorderId, roomId, _path, time, eventName });
    this.mediaRecorders[roomId][recorderId] = new werift.MediaRecorder(
      [],
      _path,
      videoPlayed
        ? {
            width,
            height,
          }
        : { width: 1, height: 1 }
    );
    this.rtc.streams[roomId][peerId].forEach((item) => {
      this.mediaRecorders[roomId][recorderId].addTrack(item);
    });
    if (!this.startTimes[roomId]) {
      this.startTimes[roomId] = {};
    }
    this.startTimes[roomId][userId] = time;
    this.mediaRecorders[roomId][recorderId].start();
  }

  public async handleVideoRecord(args: SendMessageArgs<MessageType.GET_RECORD>) {
    const {
      id: roomId,
      data: { command, userId: id },
    } = args;
    if (!this.mediaRecorders[roomId]) {
      this.mediaRecorders[roomId] = {};
    }
    switch (command) {
      case 'start':
        this.times[roomId] = 0;
        this.intervals[roomId] = setInterval(() => {
          this.times[roomId]++;
          this.settings.sendMessage({
            msg: {
              type: MessageType.SET_RECORDING,
              id,
              connId: '',
              data: {
                time: this.times[roomId],
                command,
              },
            },
            roomId,
          });
        }, 1000);
        this.dirPath[roomId] = path.resolve(
          __dirname,
          `../../rec/${new Date().getTime()}-${roomId}`
        );
        fs.mkdirSync(this.dirPath[roomId]);

        this.rtc.getKeysStreams(roomId).forEach((item) => {
          const peer = item.split(this.rtc.delimiter);
          const userId = peer[0];
          this.startStreamRecord({ roomId, userId, time: 0, eventName: 'on-start' });
        });
        break;
      case 'stop':
        clearInterval(this.intervals[roomId]);
        this.settings.sendMessage({
          msg: {
            type: MessageType.SET_RECORDING,
            id,
            connId: '',
            data: {
              time: this.times[roomId],
              command,
            },
          },
          roomId,
        });
        this.getMediaRecorderKeys(roomId).forEach((item) => {
          const peer = item.split(this.rtc.delimiter);
          const userId = peer[0];
          const recorder =
            this.mediaRecorders[roomId][
              this.getMediaRecorderId(userId, this.startTimes[roomId][userId])
            ];
          if (!recorder) {
            log('warn', 'Recorder is missing', { item });
            return;
          }
          this.stopStreamRecord({
            roomId,
            userId,
            pathStr: recorder.path,
            time: this.times[roomId],
            eventName: 'on-stop',
          });
        });
        delete this.times[roomId];
        delete this.startTimes[roomId];
        delete this.mediaRecorders[roomId];
        break;
      default:
    }
  }
}
export default RecordVideo;
