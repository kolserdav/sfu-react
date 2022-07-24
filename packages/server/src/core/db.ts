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
import { DBInterface, MessageType, SendMessageArgs, RTCInterface } from '../types/interfaces';
import { log } from '../utils/lib';
import WS from './ws';
import Browser from './browser';

const prisma = new PrismaClient();

class DB extends Browser {
  public readonly delimiter = '_';

  public rooms: Record<string | number, (string | number)[]> = {};

  public muteds: Record<string, string[]> = {};

  private ws: WS;

  public streams: Record<string, MediaStream> = {};

  /**
   * @deprecated
   */
  public peerConnections: RTCInterface['peerConnections'] = {};

  constructor({ ws }: { ws: WS }) {
    super();
    this.ws = ws;
  }

  private roomFindFirst: DBInterface['roomFindFirst'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.room.findFirst(args);
    } catch (err: any) {
      log('error', 'DB Error room find first', { args, err });
    }
    return result;
  };

  private roomUpdate: DBInterface['roomUpdate'] = async (args) => {
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

  private roomCreate: DBInterface['roomCreate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.room.create(args);
    } catch (err: any) {
      log('error', 'DB Error create room', { args, err });
    }
    return result;
  };

  private unitCreate: DBInterface['unitCreate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.unit.create(args);
    } catch (err: any) {
      log('error', 'DB Error create unit', { args, err });
    }
    return result;
  };

  private unitUpdate: DBInterface['unitUpdate'] = async (args) => {
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

  public unitCreateOrUpdate({ userId }: { userId: string }) {
    this.unitFindFirst({
      where: {
        id: userId,
      },
    }).then((u) => {
      if (u) {
        this.unitUpdate({
          where: {
            id: userId,
          },
          data: {
            updated: new Date(),
          },
        });
      } else {
        this.unitCreate({
          data: {
            id: userId,
          },
        });
      }
    });
  }

  public changeOnline({ userId, online }: { userId: string | number; online: boolean }) {
    this.unitFindFirst({
      where: { id: userId.toString() },
    }).then((u) => {
      if (u) {
        this.unitUpdate({
          where: {
            id: u.id,
          },
          data: {
            online,
            updated: new Date(),
          },
        });
      } else {
        log('warn', 'Change online unit not found', {
          userId,
          online,
        });
      }
    });
  }

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
  }: {
    message: SendMessageArgs<MessageType.GET_ROOM>;
  }) {
    log('log', 'Get room message', message);
    const {
      data: { userId },
      id,
      connId,
    } = message;
    const error = await this.addUserToRoom({
      roomId: id,
      userId,
    });
    if (error) {
      this.ws.sendMessage({
        type: MessageType.SET_ROOM,
        id: userId,
        data: undefined,
        connId,
      });
      log('warn', 'Can not add user to room', { id, userId });
      return;
    }
    const roomId = id.toString();
    const uid = userId.toString();
    this.ws.sendMessage({
      type: MessageType.SET_ROOM,
      id: userId,
      data: undefined,
      connId,
    });
    // FIXME need more details
    if (this.rooms[roomId].length === 1) {
      this.createRoom({ roomId, userId: uid });
    } else {
      this.ws.sendMessage({
        type: MessageType.SET_ROOM_LOAD,
        id: userId,
        data: {
          roomId,
        },
        connId,
      });
    }
  }

  public setRoomIsArchive({ roomId }: { roomId: string }) {
    this.roomUpdate({
      where: {
        id: roomId.toString(),
      },
      data: {
        archive: true,
        updated: new Date(),
      },
    });
  }
}

export default DB;
