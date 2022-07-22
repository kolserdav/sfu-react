/******************************************************************************************
 * Repository: https://github.com/kolserdav/react-node-webrtc-sfu.git
 * File name: this.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text:
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 14 2022 16:24:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { PrismaClient } from '@prisma/client';
import { DBInterface, MessageType, SendMessageArgs } from '../types/interfaces';
import { log } from '../utils/lib';
import WS from './ws';

const prisma = new PrismaClient();

class DB implements DBInterface {
  public readonly delimiter = '_';
  public rooms: Record<string | number, (string | number)[]> = {};
  public muteds: Record<string, string[]> = {};
  private ws: WS;
  public streams: Record<string, MediaStream> = {};

  constructor({ ws }: { ws: WS }) {
    this.ws = ws;
  }

  public roomFindFirst: DBInterface['roomFindFirst'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.room.findFirst(args);
    } catch (err: any) {
      log('error', 'DB Error room find first', { args, err });
    }
    return result;
  };

  public roomUpdate: DBInterface['roomUpdate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.room.update(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error update room', { where: args.where, data: args.data, err });
    }
    return result;
  };

  public roomCreate: DBInterface['roomCreate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.room.create(args);
    } catch (err: any) {
      log('error', 'DB Error create room', { args, err });
    }
    return result;
  };

  public unitCreate: DBInterface['unitCreate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.unit.create(args);
    } catch (err: any) {
      log('error', 'DB Error create unit', { args, err });
    }
    return result;
  };

  public unitUpdate: DBInterface['unitUpdate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.unit.update(args);
    } catch (err: any) {
      log('error', 'DB Error update unit', { args, err });
    }
    return result;
  };

  public unitFindFirst: DBInterface['unitFindFirst'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.unit.findFirst(args);
    } catch (err: any) {
      log('error', 'DB Error find first unit', { args, err });
    }
    return result;
  };

  public async addUserToRoom({
    userId,
    roomId,
  }: {
    userId: number | string;
    roomId: number | string;
  }): Promise<1 | 0> {
    const room = await this.roomFindFirst({
      where: {
        id: roomId.toString(),
      },
    });
    if (!room) {
      const authorId = userId.toString();
      this.roomCreate({
        data: {
          id: roomId.toString(),
          authorId,
          Guests: {
            create: {
              unitId: authorId,
            },
          },
        },
      });
    } else {
      if (room.archive) {
        if (room.authorId !== userId.toString()) {
          this.ws.sendMessage({
            type: MessageType.SET_ERROR,
            id: userId,
            connId: '',
            data: {
              message: 'Room is inactive',
              context: {
                id: userId,
                type: MessageType.SET_ROOM,
                connId: '',
                data: {
                  roomId,
                },
              },
            },
          });
          if (!this.rooms[roomId]) {
            this.rooms[roomId] = [];
            this.muteds[roomId] = [];
          }
          return 1;
        } else {
          await this.roomUpdate({
            where: {
              id: room.id,
            },
            data: {
              archive: false,
              updated: new Date(),
            },
          });
        }
      }

      this.unitFindFirst({
        where: {
          id: userId.toString(),
        },
        select: {
          IGuest: {
            select: {
              id: true,
            },
          },
        },
      }).then((g) => {
        const id = roomId.toString();
        if (!g) {
          log('warn', 'Unit not found', { id: userId.toString() });
        } else if (!g?.IGuest[0]) {
          this.unitUpdate({
            where: {
              id: userId.toString(),
            },
            data: {
              IGuest: {
                create: {
                  roomId: id,
                },
              },
              updated: new Date(),
            },
          }).then((r) => {
            if (!r) {
              log('warn', 'Room not updated', { roomId });
            }
          });
        } else if (g.IGuest[0].id) {
          this.unitUpdate({
            where: {
              id: userId.toString(),
            },
            data: {
              IGuest: {
                update: {
                  where: {
                    id: g.IGuest[0].id,
                  },
                  data: {
                    updated: new Date(),
                  },
                },
              },
            },
          });
        } else {
          log('warn', 'Room not saved', { g: g.IGuest[0]?.id, id });
        }
      });
    }
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = [userId];
      this.muteds[roomId] = [];
    } else if (this.rooms[roomId].indexOf(userId) === -1) {
      this.rooms[roomId].push(userId);
    } else {
      log('info', 'Room exists and user added before.', { roomId, userId });
    }
    return 0;
  }

  public deleteGuest({ userId, roomId }: { userId: string | number; roomId: string | number }) {
    return new Promise((resolve) => {
      this.roomFindFirst({
        where: {
          id: roomId.toString(),
        },
        select: {
          Guests: {
            where: {
              unitId: userId.toString(),
            },
          },
        },
      }).then((g) => {
        if (!g) {
          log('warn', 'Can not unitFindFirst', { userId });
          resolve(0);
          return;
        }
        this.roomUpdate({
          where: {
            id: roomId.toString(),
          },
          data: {
            Guests: {
              delete: g.Guests[0]?.id
                ? {
                    id: g.Guests[0]?.id,
                  }
                : undefined,
            },
            updated: new Date(),
          },
        }).then((r) => {
          if (!r) {
            log('warn', 'Room not delete guest', { roomId, id: g.Guests[0]?.id });
            resolve(1);
          }
          log('info', 'Guest deleted', { roomId, id: g.Guests[0]?.id });
          resolve(0);
        });
      });
    });
  }

  public async handleGetRoomMessage({
    message,
    port,
    cors,
  }: {
    message: SendMessageArgs<MessageType.GET_ROOM>;
    port: number;
    cors: string;
  }) {
    log('log', 'Get room message', message);
    const {
      data: { userId: uid },
      id,
      connId,
    } = message;
    // TODO
    this.ws.sendMessage({
      type: MessageType.SET_ROOM,
      id: uid,
      data: undefined,
      connId,
    });
  }
}

export default DB;
