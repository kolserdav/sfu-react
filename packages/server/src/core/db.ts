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
import { PrismaClient, Prisma } from '@prisma/client';
import { DBInterface } from '../types/interfaces';
import { log } from '../utils/lib';
import Auth from './auth';

class DB extends Auth implements DBInterface {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;

  constructor({ prisma }: { prisma: DB['prisma'] }) {
    super();
    this.prisma = prisma;
  }

  // eslint-disable-next-line class-methods-use-this
  public roomFindFirst: DBInterface['roomFindFirst'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    try {
      result = await this.prisma.room.findFirst(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error room find first', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public roomUpdate: DBInterface['roomUpdate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    try {
      result = await this.prisma.room.update(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error update room', { where: args.where, data: args.data, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public roomCreate: DBInterface['roomCreate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    try {
      result = await this.prisma.room.create(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error create room', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public unitCreate: DBInterface['unitCreate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    try {
      result = await this.prisma.unit.create(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error create unit', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public unitUpdate: DBInterface['unitUpdate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    try {
      result = await this.prisma.unit.update(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error update unit', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public unitFindFirst: DBInterface['unitFindFirst'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    try {
      result = await this.prisma.unit.findFirst(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error find first unit', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public messageUpdate: DBInterface['messageUpdate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    try {
      result = await this.prisma.message.update(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error update message', { where: args.where, data: args.data, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public messageCreate: DBInterface['messageCreate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    try {
      result = await this.prisma.message.create(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error create message', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public quoteCreate: DBInterface['quoteCreate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    try {
      result = await this.prisma.quote.create(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error create quote', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public messageDelete: DBInterface['messageDelete'] = async (args) => {
    let message;
    try {
      message = await this.prisma.message.findFirst({
        where: {
          id: args.where.id,
        },
        include: {
          Quote: true,
          MessageQuote: true,
        },
      });
    } catch (err: any) {
      log('error', 'DB Error message find first while delete', { args, err });
      return null;
    }
    if (!message) {
      return null;
    }
    if (message.Quote) {
      try {
        message = await this.prisma.message.update({
          where: {
            id: args.where.id,
          },
          data: {
            Quote: {
              delete: true,
            },
          },
          include: {
            Quote: true,
            MessageQuote: true,
          },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        log('error', 'DB Error message update while delete', { args, err });
        return null;
      }
    }
    if (!message) {
      return null;
    }
    if (message.MessageQuote?.length) {
      try {
        message = await this.prisma.message.update({
          where: {
            id: args.where.id,
          },
          data: {
            Message: {
              updateMany: [
                {
                  where: {
                    messageId: message.id,
                  },
                  data: {
                    quoteId: null,
                  },
                },
              ],
            },
          },
        });
      } catch (err: any) {
        log('error', 'DB Error update message while delete 2', { args, err });
        return null;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    try {
      result = await this.prisma.message.delete(args);
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
      count = await this.prisma.message.count({
        where,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'Error get count of messages', { err });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data;
    try {
      data = await this.prisma.message.findMany(args);
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
    let result: any;
    try {
      result = await this.prisma.video.findFirst(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error video find first', { where: args.where, data: args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public videoUpdate: DBInterface['videoUpdate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    try {
      result = await this.prisma.video.update(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error update video', { where: args.where, data: args.data, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public videoCreate: DBInterface['videoCreate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    try {
      result = await this.prisma.video.create(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error create video', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public videoDelete: DBInterface['videoDelete'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    try {
      result = await this.prisma.video.delete(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error delete video', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public adminsFindFirst: DBInterface['adminsFindFirst'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    try {
      result = await this.prisma.admins.findFirst(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error admins find first', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public adminsCreate: DBInterface['adminsCreate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    try {
      result = await this.prisma.admins.create(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error admins create', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public adminsUpdate: DBInterface['adminsUpdate'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    try {
      result = await this.prisma.admins.update(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error admins update', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public adminsDelete: DBInterface['adminsDelete'] = async (args) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    try {
      result = await this.prisma.admins.delete(args);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'DB Error admins delete', { args, err });
    }
    return result;
  };

  // eslint-disable-next-line class-methods-use-this
  public videoFindMany: DBInterface['videoFindMany'] = async (args) => {
    const { where, skip, take } = args;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let count = 0;
    try {
      count = await this.prisma.video.count({
        where,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      log('error', 'Error get count of videos', { err });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data;
    try {
      data = await this.prisma.video.findMany(args);
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

  public async changeRoomArchive({ roomId, archive }: { roomId: string; archive: boolean }) {
    const room = await this.roomFindFirst({
      where: {
        id: roomId,
      },
      include: {
        Admins: {
          select: {
            id: true,
          },
        },
      },
    });
    await this.roomUpdate({
      where: {
        id: roomId,
      },
      data: {
        archive,
        Admins:
          room?.authorId === null
            ? {
                deleteMany: room?.Admins,
              }
            : undefined,
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

  public saveGuest({ userId, roomId }: { userId: string; roomId: string }) {
    this.unitFindFirst({
      where: {
        id: userId,
      },
      select: {
        IGuest: {
          select: {
            id: true,
          },
        },
      },
    }).then((g) => {
      const id = roomId;
      if (!g) {
        log('warn', 'Unit not found', { id: userId });
      } else if (!g?.IGuest[0]) {
        this.unitUpdate({
          where: {
            id: userId,
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
            id: userId,
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
}

export default DB;
