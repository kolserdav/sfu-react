import { DBInterface, MessageType } from '../types/interfaces';
import type { Prisma, PrismaPromise } from '../types/prisma';
import WS from './ws';

class DB extends WS implements DBInterface {
  token = 'null';

  constructor() {
    super();
  }

  public userCreate: DBInterface['userCreate'] = (args) => {
    const _connection = this.newConnection();
    this.sendMessage({
      type: MessageType.GET_USER_FINDFIRST,
      data: {
        token: this.token,
        userFindFirst: args,
      },
    });
  };

  public userFindFirst: DBInterface['userFindFirst'] = (args) => {
    const _connection = this.newConnection();
    this.sendMessage({
      type: MessageType.GET_USER_FINDFIRST,
      data: {
        token: this.token,
        userFindFirst: {
          where: {
            id: 1,
          },
        },
      },
    });
  };
}

export default DB;
