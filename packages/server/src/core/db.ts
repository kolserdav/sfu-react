/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: db.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Jul 29 2022 21:35:51 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { PrismaClient } from '@prisma/client';
import { DBInterface } from '../types/interfaces';
import { log } from '../utils/lib';

const prisma = new PrismaClient();

class DB implements DBInterface {
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
}

export default DB;
