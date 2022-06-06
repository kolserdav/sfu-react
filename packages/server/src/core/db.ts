import { PrismaClient } from '@prisma/client';
import { DBInterface } from '../types/interfaces';
import { log, parseToken } from '../utils/lib';

const prisma = new PrismaClient({ log: ['warn'] });

class DB implements DBInterface {
  public getUserId = async (
    id: number,
    token: string
  ): Promise<{ id: number; token: string | null }> => {
    const _token = parseToken(token);
    let _id = 0;
    if (_token === null) {
      if (id !== 0) {
        const user = await this.guestFindFirst({
          where: {
            id,
          },
          select: {
            User: {
              select: {
                id: true,
              },
            },
          },
        });
        if (user !== null) {
          _id = id;
        } else {
          const user = await this.guestCreate({
            data: {},
          });
          if (user) {
            _id = user.id;
          }
        }
      } else {
        const user = await this.guestCreate({
          data: {},
        });
        if (user) {
          _id = user.id;
        }
      }
    } else {
      const user = await this.guestFindFirst({
        where: {
          id: _token.id,
        },
        include: {
          User: {
            select: {
              email: true,
            },
          },
        },
      });
      if (user) {
        if (user.User.length === 0) {
          await this.guestUpdate({
            where: {
              id: _token.id,
            },
            data: {
              User: {
                create: {
                  email: _token.email,
                },
              },
              lastVisit: new Date(),
            },
          });
        }
        _id = user.id;
      } else {
        const user = await this.guestCreate({
          data: {
            User: {
              create: {
                email: _token.email,
              },
            },
          },
        });
        if (user) {
          _id = user.id;
        }
      }
    }
    return {
      id: _id,
      token,
    };
  };

  public guestUpdate: DBInterface['guestUpdate'] = async (args) => {
    let user: any;
    try {
      user = await prisma.guest.update(args);
    } catch (err) {
      log('error', 'createUser', err);
    }
    return user;
  };

  public guestCreate: DBInterface['guestCreate'] = async (args) => {
    let user: any;
    try {
      user = await prisma.guest.create(args);
    } catch (err) {
      log('error', 'createUser', err);
    }
    return user;
  };
  public guestFindFirst: DBInterface['guestFindFirst'] = async (args) => {
    let user: any;
    try {
      user = await prisma.guest.findFirst(args);
    } catch (err) {
      log('error', 'createUser', err);
    }
    return user;
  };
}

export default DB;
