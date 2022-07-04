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
    } catch (err: any) {
      log('error', 'DB Error update room', { args, err });
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
}

export default DB;
