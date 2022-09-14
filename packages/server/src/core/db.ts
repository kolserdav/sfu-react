/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: db.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { PrismaClient } from '@prisma/client';
import { DBInterface } from '../types/interfaces';
import { log } from '../utils/lib';

const prisma = new PrismaClient();

class DB implements DBInterface {
  // eslint-disable-next-line class-methods-use-this
  public roomFindFirst: DBInterface['roomFindFirst'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.room.findFirst(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error room find first', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
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

  // eslint-disable-next-line class-methods-use-this
  public roomCreate: DBInterface['roomCreate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.room.create(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error create room', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public unitCreate: DBInterface['unitCreate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.unit.create(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error create unit', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public unitUpdate: DBInterface['unitUpdate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.unit.update(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error update unit', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public unitFindFirst: DBInterface['unitFindFirst'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.unit.findFirst(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error find first unit', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public messageUpdate: DBInterface['messageUpdate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.message.update(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error update message', { where: args.where, data: args.data, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public messageCreate: DBInterface['messageCreate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.message.create(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error create message', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public messageDelete: DBInterface['messageDelete'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.message.delete(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error delete message', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public messageFindMany: DBInterface['messageFindMany'] = async (args) => {
    const { where, skip, take } = args;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let count = 0;
    try {
      count = await prisma.message.count({
        where,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'Error get count of messages', { err });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any = null;
    try {
      data = await prisma.message.findMany(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'Error get messages', { err });
    }
    return {
      result: data,
      skip,
      take,
      count,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  };

  // eslint-disable-next-line class-methods-use-this
  public videoFindFirst: DBInterface['videoFindFirst'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.video.findFirst(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error video find first', { where: args.where, data: args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public videoUpdate: DBInterface['videoUpdate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.video.update(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error update video', { where: args.where, data: args.data, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public videoCreate: DBInterface['videoCreate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.video.create(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error create video', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public videoDelete: DBInterface['videoDelete'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = null;
    try {
      result = await prisma.video.delete(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error delete video', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public videoFindMany: DBInterface['videoFindMany'] = async (args) => {
    const { where, skip, take } = args;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let count = 0;
    try {
      count = await prisma.video.count({
        where,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'Error get count of videos', { err });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any = null;
    try {
      data = await prisma.video.findMany(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'Error get video', { err });
    }
    return {
      result: data,
      skip,
      take,
      count,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  };

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

  public changeUserOnline({ userId, online }: { userId: string | number; online: boolean }) {
    this.unitUpdate({
      where: {
        id: userId.toString(),
      },
      data: {
        online,
        updated: new Date(),
      },
    });
  }

  public changeRoomArchive({ userId, archive }: { userId: string; archive: boolean }) {
    this.roomUpdate({
      where: {
        id: userId,
      },
      data: {
        archive,
        updated: new Date(),
      },
    });
  }

  public videoUpdateTime = async ({ roomId, time }: { roomId: string | number; time: number }) => {
    const video = await this.videoFindFirst({
      where: {
        roomId: roomId.toString(),
      },
      orderBy: {
        created: 'desc',
      },
    });
    if (video) {
      this.videoUpdate({
        where: {
          id: video.id,
        },
        data: {
          time,
          updated: new Date(),
        },
      });
    } else {
      log('warn', 'Video not found', { roomId, time });
    }
  };
}

export default DB;
