/******************************************************************************************
 * Repository: https://github.com/skaz2/bubuleo_api
 * File name: index.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: Proprietary and confidential
 * License text: Unauthorized copying of this file, via any medium is strictly prohibited
 * Copyright: kolserdav (c), All rights reserved
 * Create Date: Sat Dec 18 2021 14:28:19 GMT+0700 (Красноярск, стандартное время)
 ******************************************************************************************/
/**
 * Глобальные посредники
 */
import { PrismaClient, Prisma } from '@prisma/client';
import { log, parseToken } from './lib';

const prisma = new PrismaClient();

/**
 * Глобальные поля которые запрещено менять напрямую
 */
const GLOBAL_CLOSED_FIELDS_FOR_ALL = [
  'password',
  'email',
  'created_at',
  'updated_at',
  'id',
  'role',
];

/**
 * Параметры аутентификации
 */
interface CheckRoleParams<
  Model extends keyof typeof Prisma.ModelName,
  Field extends keyof typeof Prisma['UserScalarFieldEnum']
> {
  token: string;
  args: any;
  /**
   * Открыть только для админа
   */
  onlyAdmin?: boolean;
  /**
   * Закрыть узел для доступа того кому не пренадлежить модель
   */
  selfUsage?: {
    /**
     * Название модели см. `src/orm/prisma.schema`
     */
    model: Model;
    /**
     * Поле которое должно соответствовать id пользователя делающего запрос
     */
    field: Field;
    /**
     * Если `true`, то запрос открыт и для админа
     */
    andAdmin?: boolean;
    /**
     * Список полей которые пользователь не может менять.
     * Если andAdmin=true то не действует на админа
     */
    closedSelf?: (Field | keyof typeof Prisma.ModelName)[];
    /**
     * Список полей которые администратор не может менять если даже andAdmin=tue.
     */
    closedAdmin?: (Field | keyof typeof Prisma.ModelName)[];
  };
}

/**
 * служебная функция делает строчным первый символ строки
 * @param string
 * @returns
 */
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

export const auth = async <Model extends keyof typeof Prisma.ModelName>({
  onlyAdmin,
  selfUsage,
  token,
  args,
}: CheckRoleParams<
  keyof typeof Prisma.ModelName,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  keyof typeof Prisma[`${Model}ScalarFieldEnum`]
>): // eslint-disable-next-line @typescript-eslint/no-explicit-any
Promise<string | null> => {
  const parsedToken = parseToken(token);
  if (parsedToken === null) {
    return 'Parse token error';
  }
  const { id } = parsedToken;
  let user;
  try {
    user = await prisma.user.findUnique({ where: { id } });
  } catch (e) {
    return 'Error get user by id in auth middleware';
  }
  if (user === null) {
    return `User not found ${JSON.stringify(parsedToken)}`;
  }
  const _admin = user.role === 'admin';
  if (onlyAdmin && !_admin) {
    return 'Only for admin';
  }
  let selfResult;
  if (selfUsage) {
    if (!args) {
      return 'Argument args is missing';
    }
    if (!args.where) {
      return 'Argument args.where is missing';
    }
    const { where } = args;
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      selfResult = await prisma[capitalizeFirstLetter(selfUsage.model)].findUnique({
        where,
        select: {
          [selfUsage.field]: true,
        },
      });
    } catch (e) {
      return 'Error auth multi find first';
    }
    if (selfResult === null) {
      return 'Self model is not defined';
    }
    if (
      parsedToken.id !== selfResult[selfUsage.field] &&
      selfResult[selfUsage.field] !== 'application/octet-stream'
    ) {
      if (!(_admin && selfUsage.andAdmin)) {
        return 'Only for admins. Or only for yourself.';
      }
    }
  }
  const closedSelf = selfUsage?.closedSelf;
  if (closedSelf && closedSelf?.length !== 0 && !(_admin && selfUsage?.andAdmin)) {
    for (const prop in args.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyProp: any = prop;
      if (
        closedSelf.indexOf(anyProp) !== -1 ||
        GLOBAL_CLOSED_FIELDS_FOR_ALL.indexOf(anyProp) !== -1
      ) {
        return `Field "${prop}" can't update yourself`;
      }
    }
  }
  const closedAdmin = selfUsage?.closedAdmin;
  if (
    closedAdmin &&
    closedAdmin?.length !== 0 &&
    _admin &&
    selfUsage?.andAdmin &&
    parsedToken.id !== selfResult.id
  ) {
    for (const prop in args.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyProp: any = prop;
      if (
        closedAdmin.indexOf(anyProp) !== -1 ||
        GLOBAL_CLOSED_FIELDS_FOR_ALL.indexOf(anyProp) !== -1
      ) {
        return `Field "${prop}" can't update by admin`;
      }
    }
  }
  return null;
};
