import { PrismaClient } from '@prisma/client';
import { DBInterface } from '../types/interfaces';
import { log } from '../utils/lib';

const prisma = new PrismaClient({ log: ['warn'] });

class DB implements DBInterface {
  public userCreate: DBInterface['userCreate'] = async (args) => {
    let user: any;
    try {
      user = await prisma.user.create(args);
    } catch (err) {
      log('error', 'createUser', err);
    }
    return user;
  };
  public userFindFirst: DBInterface['userFindFirst'] = async (args) => {
    let user: any;
    try {
      user = await prisma.user.findFirst(args);
    } catch (err) {
      log('error', 'createUser', err);
    }
    return user;
  };
}

export default DB;
