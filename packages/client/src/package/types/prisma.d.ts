
/**
 * Client
**/

import * as runtime from '@prisma/client/runtime/index';
declare const prisma: unique symbol
export type PrismaPromise<A> = Promise<A> & {[prisma]: true}
type UnwrapPromise<P extends any> = P extends Promise<infer R> ? R : P
type UnwrapTuple<Tuple extends readonly unknown[]> = {
  [K in keyof Tuple]: K extends `${number}` ? Tuple[K] extends PrismaPromise<infer X> ? X : UnwrapPromise<Tuple[K]> : UnwrapPromise<Tuple[K]>
};


/**
 * Model Unit
 * 
 */
export type Unit = {
  id: string
  name: string | null
  updated: Date
  created: Date
}

/**
 * Model Room
 * 
 */
export type Room = {
  id: string
  authorId: string
  archive: boolean
  updated: Date
  created: Date
}

/**
 * Model Guest
 * 
 */
export type Guest = {
  id: number
  unitId: string
  roomId: string
  created: Date
}

/**
 * Model Message
 * 
 */
export type Message = {
  id: number
  text: string
  unitId: string
  roomId: string
  updated: Date
  created: Date
}


/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Units
 * const units = await prisma.unit.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  T extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof T ? T['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<T['log']> : never : never,
  GlobalReject = 'rejectOnNotFound' extends keyof T
    ? T['rejectOnNotFound']
    : false
      > {
      /**
       * @private
       */
      private fetcher;
      /**
       * @private
       */
      private readonly dmmf;
      /**
       * @private
       */
      private connectionPromise?;
      /**
       * @private
       */
      private disconnectionPromise?;
      /**
       * @private
       */
      private readonly engineConfig;
      /**
       * @private
       */
      private readonly measurePerformance;

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Units
   * const units = await prisma.unit.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<T, Prisma.PrismaClientOptions>);
  $on<V extends (U | 'beforeExit')>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : V extends 'beforeExit' ? () => Promise<void> : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): Promise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): Promise<void>;

  /**
   * Add a middleware
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends PrismaPromise<any>[]>(arg: [...P]): Promise<UnwrapTuple<P>>;

      /**
   * `prisma.unit`: Exposes CRUD operations for the **Unit** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Units
    * const units = await prisma.unit.findMany()
    * ```
    */
  get unit(): Prisma.UnitDelegate<GlobalReject>;

  /**
   * `prisma.room`: Exposes CRUD operations for the **Room** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Rooms
    * const rooms = await prisma.room.findMany()
    * ```
    */
  get room(): Prisma.RoomDelegate<GlobalReject>;

  /**
   * `prisma.guest`: Exposes CRUD operations for the **Guest** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Guests
    * const guests = await prisma.guest.findMany()
    * ```
    */
  get guest(): Prisma.GuestDelegate<GlobalReject>;

  /**
   * `prisma.message`: Exposes CRUD operations for the **Message** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Messages
    * const messages = await prisma.message.findMany()
    * ```
    */
  get message(): Prisma.MessageDelegate<GlobalReject>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export import Metrics = runtime.Metrics
  export import Metric = runtime.Metric
  export import MetricHistogram = runtime.MetricHistogram
  export import MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
   * Prisma Client JS version: 4.0.0
   * Query Engine version: da41d2bb3406da22087b849f0e911199ba4fbf11
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON object.
   * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. 
   */
  export type JsonObject = {[Key in string]?: JsonValue}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON array.
   */
  export interface JsonArray extends Array<JsonValue> {}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches any valid JSON value.
   */
  export type JsonValue = string | number | boolean | JsonObject | JsonArray | null

  /**
   * Matches a JSON object.
   * Unlike `JsonObject`, this type allows undefined and read-only properties.
   */
  export type InputJsonObject = {readonly [Key in string]?: InputJsonValue | null}

  /**
   * Matches a JSON array.
   * Unlike `JsonArray`, readonly arrays are assignable to this type.
   */
  export interface InputJsonArray extends ReadonlyArray<InputJsonValue | null> {}

  /**
   * Matches any valid value that can be used as an input for operations like
   * create and update as the value of a JSON field. Unlike `JsonValue`, this
   * type allows read-only arrays and read-only object properties and disallows
   * `null` at the top level.
   *
   * `null` cannot be used as the value of a JSON field because its meaning
   * would be ambiguous. Use `Prisma.JsonNull` to store the JSON null value or
   * `Prisma.DbNull` to clear the JSON value and set the field to the database
   * NULL value instead.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-by-null-values
   */
  export type InputJsonValue = string | number | boolean | InputJsonObject | InputJsonArray

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }
  type HasSelect = {
    select: any
  }
  type HasInclude = {
    include: any
  }
  type CheckSelect<T, S, U> = T extends SelectAndInclude
    ? 'Please either choose `select` or `include`'
    : T extends HasSelect
    ? U
    : T extends HasInclude
    ? U
    : S

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => Promise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = {
    [key in keyof T]: T[key] extends false | undefined | null ? never : key
  }[keyof T]

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Buffer
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Exact<A, W = unknown> = 
  W extends unknown ? A extends Narrowable ? Cast<A, W> : Cast<
  {[K in keyof A]: K extends keyof W ? Exact<A[K], W[K]> : never},
  {[K in keyof W]: K extends keyof A ? Exact<A[K], W[K]> : W[K]}>
  : never;

  type Narrowable = string | number | boolean | bigint;

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;

  export function validator<V>(): <S>(select: Exact<S, V>) => S;

  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but with an array
   */
  type PickArray<T, K extends Array<keyof T>> = Prisma__Pick<T, TupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T

  class PrismaClientFetcher {
    private readonly prisma;
    private readonly debug;
    private readonly hooks?;
    constructor(prisma: PrismaClient<any, any>, debug?: boolean, hooks?: Hooks | undefined);
    request<T>(document: any, dataPath?: string[], rootField?: string, typeName?: string, isList?: boolean, callsite?: string): Promise<T>;
    sanitizeMessage(message: string): string;
    protected unpack(document: any, data: any, path: string[], rootField?: string, isList?: boolean): any;
  }

  export const ModelName: {
    Unit: 'Unit',
    Room: 'Room',
    Guest: 'Guest',
    Message: 'Message'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  export type RejectOnNotFound = boolean | ((error: Error) => Error)
  export type RejectPerModel = { [P in ModelName]?: RejectOnNotFound }
  export type RejectPerOperation =  { [P in "findUnique" | "findFirst"]?: RejectPerModel | RejectOnNotFound } 
  type IsReject<T> = T extends true ? True : T extends (err: Error) => Error ? True : False
  export type HasReject<
    GlobalRejectSettings extends Prisma.PrismaClientOptions['rejectOnNotFound'],
    LocalRejectSettings,
    Action extends PrismaAction,
    Model extends ModelName
  > = LocalRejectSettings extends RejectOnNotFound
    ? IsReject<LocalRejectSettings>
    : GlobalRejectSettings extends RejectPerOperation
    ? Action extends keyof GlobalRejectSettings
      ? GlobalRejectSettings[Action] extends RejectOnNotFound
        ? IsReject<GlobalRejectSettings[Action]>
        : GlobalRejectSettings[Action] extends RejectPerModel
        ? Model extends keyof GlobalRejectSettings[Action]
          ? IsReject<GlobalRejectSettings[Action][Model]>
          : False
        : False
      : False
    : IsReject<GlobalRejectSettings>
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'

  export interface PrismaClientOptions {
    /**
     * Configure findUnique/findFirst to throw an error if the query returns null. 
     * @deprecated since 4.0.0. Use `findUniqueOrThrow`/`findFirstOrThrow` methods instead.
     * @example
     * ```
     * // Reject on both findUnique/findFirst
     * rejectOnNotFound: true
     * // Reject only on findFirst with a custom error
     * rejectOnNotFound: { findFirst: (err) => new Error("Custom Error")}
     * // Reject on user.findUnique with a custom error
     * rejectOnNotFound: { findUnique: {User: (err) => new Error("User not found")}}
     * ```
     */
    rejectOnNotFound?: RejectOnNotFound | RejectPerOperation
    /**
     * Overwrites the datasource url from your prisma.schema file
     */
    datasources?: Datasources

    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat

    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: Array<LogLevel | LogDefinition>
  }

  export type Hooks = {
    beforeRequest?: (options: { query: string, path: string[], rootField?: string, typeName?: string, document: any }) => any
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findMany'
    | 'findFirst'
    | 'create'
    | 'createMany'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'

  /**
   * These options are being passed in to the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => Promise<T>,
  ) => Promise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UnitCountOutputType
   */


  export type UnitCountOutputType = {
    MyRooms: number
    IGuest: number
    Message: number
  }

  export type UnitCountOutputTypeSelect = {
    MyRooms?: boolean
    IGuest?: boolean
    Message?: boolean
  }

  export type UnitCountOutputTypeGetPayload<
    S extends boolean | null | undefined | UnitCountOutputTypeArgs,
    U = keyof S
      > = S extends true
        ? UnitCountOutputType
    : S extends undefined
    ? never
    : S extends UnitCountOutputTypeArgs
    ?'include' extends U
    ? UnitCountOutputType 
    : 'select' extends U
    ? {
    [P in TrueKeys<S['select']>]:
    P extends keyof UnitCountOutputType ? UnitCountOutputType[P] : never
  } 
    : UnitCountOutputType
  : UnitCountOutputType




  // Custom InputTypes

  /**
   * UnitCountOutputType without action
   */
  export type UnitCountOutputTypeArgs = {
    /**
     * Select specific fields to fetch from the UnitCountOutputType
     * 
    **/
    select?: UnitCountOutputTypeSelect | null
  }



  /**
   * Count Type RoomCountOutputType
   */


  export type RoomCountOutputType = {
    Guests: number
    Message: number
  }

  export type RoomCountOutputTypeSelect = {
    Guests?: boolean
    Message?: boolean
  }

  export type RoomCountOutputTypeGetPayload<
    S extends boolean | null | undefined | RoomCountOutputTypeArgs,
    U = keyof S
      > = S extends true
        ? RoomCountOutputType
    : S extends undefined
    ? never
    : S extends RoomCountOutputTypeArgs
    ?'include' extends U
    ? RoomCountOutputType 
    : 'select' extends U
    ? {
    [P in TrueKeys<S['select']>]:
    P extends keyof RoomCountOutputType ? RoomCountOutputType[P] : never
  } 
    : RoomCountOutputType
  : RoomCountOutputType




  // Custom InputTypes

  /**
   * RoomCountOutputType without action
   */
  export type RoomCountOutputTypeArgs = {
    /**
     * Select specific fields to fetch from the RoomCountOutputType
     * 
    **/
    select?: RoomCountOutputTypeSelect | null
  }



  /**
   * Models
   */

  /**
   * Model Unit
   */


  export type AggregateUnit = {
    _count: UnitCountAggregateOutputType | null
    _min: UnitMinAggregateOutputType | null
    _max: UnitMaxAggregateOutputType | null
  }

  export type UnitMinAggregateOutputType = {
    id: string | null
    name: string | null
    updated: Date | null
    created: Date | null
  }

  export type UnitMaxAggregateOutputType = {
    id: string | null
    name: string | null
    updated: Date | null
    created: Date | null
  }

  export type UnitCountAggregateOutputType = {
    id: number
    name: number
    updated: number
    created: number
    _all: number
  }


  export type UnitMinAggregateInputType = {
    id?: true
    name?: true
    updated?: true
    created?: true
  }

  export type UnitMaxAggregateInputType = {
    id?: true
    name?: true
    updated?: true
    created?: true
  }

  export type UnitCountAggregateInputType = {
    id?: true
    name?: true
    updated?: true
    created?: true
    _all?: true
  }

  export type UnitAggregateArgs = {
    /**
     * Filter which Unit to aggregate.
     * 
    **/
    where?: UnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Units to fetch.
     * 
    **/
    orderBy?: Enumerable<UnitOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     * 
    **/
    cursor?: UnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Units from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Units.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Units
    **/
    _count?: true | UnitCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UnitMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UnitMaxAggregateInputType
  }

  export type GetUnitAggregateType<T extends UnitAggregateArgs> = {
        [P in keyof T & keyof AggregateUnit]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUnit[P]>
      : GetScalarType<T[P], AggregateUnit[P]>
  }




  export type UnitGroupByArgs = {
    where?: UnitWhereInput
    orderBy?: Enumerable<UnitOrderByWithAggregationInput>
    by: Array<UnitScalarFieldEnum>
    having?: UnitScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UnitCountAggregateInputType | true
    _min?: UnitMinAggregateInputType
    _max?: UnitMaxAggregateInputType
  }


  export type UnitGroupByOutputType = {
    id: string
    name: string | null
    updated: Date
    created: Date
    _count: UnitCountAggregateOutputType | null
    _min: UnitMinAggregateOutputType | null
    _max: UnitMaxAggregateOutputType | null
  }

  type GetUnitGroupByPayload<T extends UnitGroupByArgs> = PrismaPromise<
    Array<
      PickArray<UnitGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UnitGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UnitGroupByOutputType[P]>
            : GetScalarType<T[P], UnitGroupByOutputType[P]>
        }
      >
    >


  export type UnitSelect = {
    id?: boolean
    name?: boolean
    updated?: boolean
    created?: boolean
    MyRooms?: boolean | RoomFindManyArgs
    IGuest?: boolean | GuestFindManyArgs
    Message?: boolean | MessageFindManyArgs
    _count?: boolean | UnitCountOutputTypeArgs
  }

  export type UnitInclude = {
    MyRooms?: boolean | RoomFindManyArgs
    IGuest?: boolean | GuestFindManyArgs
    Message?: boolean | MessageFindManyArgs
    _count?: boolean | UnitCountOutputTypeArgs
  }

  export type UnitGetPayload<
    S extends boolean | null | undefined | UnitArgs,
    U = keyof S
      > = S extends true
        ? Unit
    : S extends undefined
    ? never
    : S extends UnitArgs | UnitFindManyArgs
    ?'include' extends U
    ? Unit  & {
    [P in TrueKeys<S['include']>]:
        P extends 'MyRooms' ? Array < RoomGetPayload<S['include'][P]>>  :
        P extends 'IGuest' ? Array < GuestGetPayload<S['include'][P]>>  :
        P extends 'Message' ? Array < MessageGetPayload<S['include'][P]>>  :
        P extends '_count' ? UnitCountOutputTypeGetPayload<S['include'][P]> :  never
  } 
    : 'select' extends U
    ? {
    [P in TrueKeys<S['select']>]:
        P extends 'MyRooms' ? Array < RoomGetPayload<S['select'][P]>>  :
        P extends 'IGuest' ? Array < GuestGetPayload<S['select'][P]>>  :
        P extends 'Message' ? Array < MessageGetPayload<S['select'][P]>>  :
        P extends '_count' ? UnitCountOutputTypeGetPayload<S['select'][P]> :  P extends keyof Unit ? Unit[P] : never
  } 
    : Unit
  : Unit


  type UnitCountArgs = Merge<
    Omit<UnitFindManyArgs, 'select' | 'include'> & {
      select?: UnitCountAggregateInputType | true
    }
  >

  export interface UnitDelegate<GlobalRejectSettings> {
    /**
     * Find zero or one Unit that matches the filter.
     * @param {UnitFindUniqueArgs} args - Arguments to find a Unit
     * @example
     * // Get one Unit
     * const unit = await prisma.unit.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends UnitFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, UnitFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'Unit'> extends True ? CheckSelect<T, Prisma__UnitClient<Unit>, Prisma__UnitClient<UnitGetPayload<T>>> : CheckSelect<T, Prisma__UnitClient<Unit | null >, Prisma__UnitClient<UnitGetPayload<T> | null >>

    /**
     * Find the first Unit that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitFindFirstArgs} args - Arguments to find a Unit
     * @example
     * // Get one Unit
     * const unit = await prisma.unit.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends UnitFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, UnitFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'Unit'> extends True ? CheckSelect<T, Prisma__UnitClient<Unit>, Prisma__UnitClient<UnitGetPayload<T>>> : CheckSelect<T, Prisma__UnitClient<Unit | null >, Prisma__UnitClient<UnitGetPayload<T> | null >>

    /**
     * Find zero or more Units that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Units
     * const units = await prisma.unit.findMany()
     * 
     * // Get first 10 Units
     * const units = await prisma.unit.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const unitWithIdOnly = await prisma.unit.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends UnitFindManyArgs>(
      args?: SelectSubset<T, UnitFindManyArgs>
    ): CheckSelect<T, PrismaPromise<Array<Unit>>, PrismaPromise<Array<UnitGetPayload<T>>>>

    /**
     * Create a Unit.
     * @param {UnitCreateArgs} args - Arguments to create a Unit.
     * @example
     * // Create one Unit
     * const Unit = await prisma.unit.create({
     *   data: {
     *     // ... data to create a Unit
     *   }
     * })
     * 
    **/
    create<T extends UnitCreateArgs>(
      args: SelectSubset<T, UnitCreateArgs>
    ): CheckSelect<T, Prisma__UnitClient<Unit>, Prisma__UnitClient<UnitGetPayload<T>>>

    /**
     * Create many Units.
     *     @param {UnitCreateManyArgs} args - Arguments to create many Units.
     *     @example
     *     // Create many Units
     *     const unit = await prisma.unit.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends UnitCreateManyArgs>(
      args?: SelectSubset<T, UnitCreateManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Delete a Unit.
     * @param {UnitDeleteArgs} args - Arguments to delete one Unit.
     * @example
     * // Delete one Unit
     * const Unit = await prisma.unit.delete({
     *   where: {
     *     // ... filter to delete one Unit
     *   }
     * })
     * 
    **/
    delete<T extends UnitDeleteArgs>(
      args: SelectSubset<T, UnitDeleteArgs>
    ): CheckSelect<T, Prisma__UnitClient<Unit>, Prisma__UnitClient<UnitGetPayload<T>>>

    /**
     * Update one Unit.
     * @param {UnitUpdateArgs} args - Arguments to update one Unit.
     * @example
     * // Update one Unit
     * const unit = await prisma.unit.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends UnitUpdateArgs>(
      args: SelectSubset<T, UnitUpdateArgs>
    ): CheckSelect<T, Prisma__UnitClient<Unit>, Prisma__UnitClient<UnitGetPayload<T>>>

    /**
     * Delete zero or more Units.
     * @param {UnitDeleteManyArgs} args - Arguments to filter Units to delete.
     * @example
     * // Delete a few Units
     * const { count } = await prisma.unit.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends UnitDeleteManyArgs>(
      args?: SelectSubset<T, UnitDeleteManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Update zero or more Units.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Units
     * const unit = await prisma.unit.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends UnitUpdateManyArgs>(
      args: SelectSubset<T, UnitUpdateManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Create or update one Unit.
     * @param {UnitUpsertArgs} args - Arguments to update or create a Unit.
     * @example
     * // Update or create a Unit
     * const unit = await prisma.unit.upsert({
     *   create: {
     *     // ... data to create a Unit
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Unit we want to update
     *   }
     * })
    **/
    upsert<T extends UnitUpsertArgs>(
      args: SelectSubset<T, UnitUpsertArgs>
    ): CheckSelect<T, Prisma__UnitClient<Unit>, Prisma__UnitClient<UnitGetPayload<T>>>

    /**
     * Find one Unit that matches the filter or throw
     * `NotFoundError` if no matches were found.
     * @param {UnitFindUniqueOrThrowArgs} args - Arguments to find a Unit
     * @example
     * // Get one Unit
     * const unit = await prisma.unit.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends UnitFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, UnitFindUniqueOrThrowArgs>
    ): CheckSelect<T, Prisma__UnitClient<Unit>, Prisma__UnitClient<UnitGetPayload<T>>>

    /**
     * Find the first Unit that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitFindFirstOrThrowArgs} args - Arguments to find a Unit
     * @example
     * // Get one Unit
     * const unit = await prisma.unit.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends UnitFindFirstOrThrowArgs>(
      args?: SelectSubset<T, UnitFindFirstOrThrowArgs>
    ): CheckSelect<T, Prisma__UnitClient<Unit>, Prisma__UnitClient<UnitGetPayload<T>>>

    /**
     * Count the number of Units.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitCountArgs} args - Arguments to filter Units to count.
     * @example
     * // Count the number of Units
     * const count = await prisma.unit.count({
     *   where: {
     *     // ... the filter for the Units we want to count
     *   }
     * })
    **/
    count<T extends UnitCountArgs>(
      args?: Subset<T, UnitCountArgs>,
    ): PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UnitCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Unit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UnitAggregateArgs>(args: Subset<T, UnitAggregateArgs>): PrismaPromise<GetUnitAggregateType<T>>

    /**
     * Group by Unit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UnitGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UnitGroupByArgs['orderBy'] }
        : { orderBy?: UnitGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UnitGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUnitGroupByPayload<T> : PrismaPromise<InputErrors>
  }

  /**
   * The delegate class that acts as a "Promise-like" for Unit.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__UnitClient<T> implements PrismaPromise<T> {
    [prisma]: true;
    private readonly _dmmf;
    private readonly _fetcher;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    constructor(_dmmf: runtime.DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
    readonly [Symbol.toStringTag]: 'PrismaClientPromise';

    MyRooms<T extends RoomFindManyArgs = {}>(args?: Subset<T, RoomFindManyArgs>): CheckSelect<T, PrismaPromise<Array<Room>>, PrismaPromise<Array<RoomGetPayload<T>>>>;

    IGuest<T extends GuestFindManyArgs = {}>(args?: Subset<T, GuestFindManyArgs>): CheckSelect<T, PrismaPromise<Array<Guest>>, PrismaPromise<Array<GuestGetPayload<T>>>>;

    Message<T extends MessageFindManyArgs = {}>(args?: Subset<T, MessageFindManyArgs>): CheckSelect<T, PrismaPromise<Array<Message>>, PrismaPromise<Array<MessageGetPayload<T>>>>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }

  // Custom InputTypes

  /**
   * Unit base type for findUnique actions
   */
  export type UnitFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the Unit
     * 
    **/
    select?: UnitSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: UnitInclude | null
    /**
     * Filter, which Unit to fetch.
     * 
    **/
    where: UnitWhereUniqueInput
  }

  /**
   * Unit: findUnique
   */
  export interface UnitFindUniqueArgs extends UnitFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Unit base type for findFirst actions
   */
  export type UnitFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the Unit
     * 
    **/
    select?: UnitSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: UnitInclude | null
    /**
     * Filter, which Unit to fetch.
     * 
    **/
    where?: UnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Units to fetch.
     * 
    **/
    orderBy?: Enumerable<UnitOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Units.
     * 
    **/
    cursor?: UnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Units from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Units.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Units.
     * 
    **/
    distinct?: Enumerable<UnitScalarFieldEnum>
  }

  /**
   * Unit: findFirst
   */
  export interface UnitFindFirstArgs extends UnitFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Unit findMany
   */
  export type UnitFindManyArgs = {
    /**
     * Select specific fields to fetch from the Unit
     * 
    **/
    select?: UnitSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: UnitInclude | null
    /**
     * Filter, which Units to fetch.
     * 
    **/
    where?: UnitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Units to fetch.
     * 
    **/
    orderBy?: Enumerable<UnitOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Units.
     * 
    **/
    cursor?: UnitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Units from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Units.
     * 
    **/
    skip?: number
    distinct?: Enumerable<UnitScalarFieldEnum>
  }


  /**
   * Unit create
   */
  export type UnitCreateArgs = {
    /**
     * Select specific fields to fetch from the Unit
     * 
    **/
    select?: UnitSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: UnitInclude | null
    /**
     * The data needed to create a Unit.
     * 
    **/
    data: XOR<UnitCreateInput, UnitUncheckedCreateInput>
  }


  /**
   * Unit createMany
   */
  export type UnitCreateManyArgs = {
    /**
     * The data used to create many Units.
     * 
    **/
    data: Enumerable<UnitCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * Unit update
   */
  export type UnitUpdateArgs = {
    /**
     * Select specific fields to fetch from the Unit
     * 
    **/
    select?: UnitSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: UnitInclude | null
    /**
     * The data needed to update a Unit.
     * 
    **/
    data: XOR<UnitUpdateInput, UnitUncheckedUpdateInput>
    /**
     * Choose, which Unit to update.
     * 
    **/
    where: UnitWhereUniqueInput
  }


  /**
   * Unit updateMany
   */
  export type UnitUpdateManyArgs = {
    /**
     * The data used to update Units.
     * 
    **/
    data: XOR<UnitUpdateManyMutationInput, UnitUncheckedUpdateManyInput>
    /**
     * Filter which Units to update
     * 
    **/
    where?: UnitWhereInput
  }


  /**
   * Unit upsert
   */
  export type UnitUpsertArgs = {
    /**
     * Select specific fields to fetch from the Unit
     * 
    **/
    select?: UnitSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: UnitInclude | null
    /**
     * The filter to search for the Unit to update in case it exists.
     * 
    **/
    where: UnitWhereUniqueInput
    /**
     * In case the Unit found by the `where` argument doesn't exist, create a new Unit with this data.
     * 
    **/
    create: XOR<UnitCreateInput, UnitUncheckedCreateInput>
    /**
     * In case the Unit was found with the provided `where` argument, update it with this data.
     * 
    **/
    update: XOR<UnitUpdateInput, UnitUncheckedUpdateInput>
  }


  /**
   * Unit delete
   */
  export type UnitDeleteArgs = {
    /**
     * Select specific fields to fetch from the Unit
     * 
    **/
    select?: UnitSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: UnitInclude | null
    /**
     * Filter which Unit to delete.
     * 
    **/
    where: UnitWhereUniqueInput
  }


  /**
   * Unit deleteMany
   */
  export type UnitDeleteManyArgs = {
    /**
     * Filter which Units to delete
     * 
    **/
    where?: UnitWhereInput
  }


  /**
   * Unit: findUniqueOrThrow
   */
  export type UnitFindUniqueOrThrowArgs = UnitFindUniqueArgsBase
      

  /**
   * Unit: findFirstOrThrow
   */
  export type UnitFindFirstOrThrowArgs = UnitFindFirstArgsBase
      

  /**
   * Unit without action
   */
  export type UnitArgs = {
    /**
     * Select specific fields to fetch from the Unit
     * 
    **/
    select?: UnitSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: UnitInclude | null
  }



  /**
   * Model Room
   */


  export type AggregateRoom = {
    _count: RoomCountAggregateOutputType | null
    _min: RoomMinAggregateOutputType | null
    _max: RoomMaxAggregateOutputType | null
  }

  export type RoomMinAggregateOutputType = {
    id: string | null
    authorId: string | null
    archive: boolean | null
    updated: Date | null
    created: Date | null
  }

  export type RoomMaxAggregateOutputType = {
    id: string | null
    authorId: string | null
    archive: boolean | null
    updated: Date | null
    created: Date | null
  }

  export type RoomCountAggregateOutputType = {
    id: number
    authorId: number
    archive: number
    updated: number
    created: number
    _all: number
  }


  export type RoomMinAggregateInputType = {
    id?: true
    authorId?: true
    archive?: true
    updated?: true
    created?: true
  }

  export type RoomMaxAggregateInputType = {
    id?: true
    authorId?: true
    archive?: true
    updated?: true
    created?: true
  }

  export type RoomCountAggregateInputType = {
    id?: true
    authorId?: true
    archive?: true
    updated?: true
    created?: true
    _all?: true
  }

  export type RoomAggregateArgs = {
    /**
     * Filter which Room to aggregate.
     * 
    **/
    where?: RoomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rooms to fetch.
     * 
    **/
    orderBy?: Enumerable<RoomOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     * 
    **/
    cursor?: RoomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rooms from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rooms.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Rooms
    **/
    _count?: true | RoomCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RoomMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RoomMaxAggregateInputType
  }

  export type GetRoomAggregateType<T extends RoomAggregateArgs> = {
        [P in keyof T & keyof AggregateRoom]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRoom[P]>
      : GetScalarType<T[P], AggregateRoom[P]>
  }




  export type RoomGroupByArgs = {
    where?: RoomWhereInput
    orderBy?: Enumerable<RoomOrderByWithAggregationInput>
    by: Array<RoomScalarFieldEnum>
    having?: RoomScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RoomCountAggregateInputType | true
    _min?: RoomMinAggregateInputType
    _max?: RoomMaxAggregateInputType
  }


  export type RoomGroupByOutputType = {
    id: string
    authorId: string
    archive: boolean
    updated: Date
    created: Date
    _count: RoomCountAggregateOutputType | null
    _min: RoomMinAggregateOutputType | null
    _max: RoomMaxAggregateOutputType | null
  }

  type GetRoomGroupByPayload<T extends RoomGroupByArgs> = PrismaPromise<
    Array<
      PickArray<RoomGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RoomGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RoomGroupByOutputType[P]>
            : GetScalarType<T[P], RoomGroupByOutputType[P]>
        }
      >
    >


  export type RoomSelect = {
    id?: boolean
    authorId?: boolean
    Unit?: boolean | UnitArgs
    archive?: boolean
    updated?: boolean
    created?: boolean
    Guests?: boolean | GuestFindManyArgs
    Message?: boolean | MessageFindManyArgs
    _count?: boolean | RoomCountOutputTypeArgs
  }

  export type RoomInclude = {
    Unit?: boolean | UnitArgs
    Guests?: boolean | GuestFindManyArgs
    Message?: boolean | MessageFindManyArgs
    _count?: boolean | RoomCountOutputTypeArgs
  }

  export type RoomGetPayload<
    S extends boolean | null | undefined | RoomArgs,
    U = keyof S
      > = S extends true
        ? Room
    : S extends undefined
    ? never
    : S extends RoomArgs | RoomFindManyArgs
    ?'include' extends U
    ? Room  & {
    [P in TrueKeys<S['include']>]:
        P extends 'Unit' ? UnitGetPayload<S['include'][P]> :
        P extends 'Guests' ? Array < GuestGetPayload<S['include'][P]>>  :
        P extends 'Message' ? Array < MessageGetPayload<S['include'][P]>>  :
        P extends '_count' ? RoomCountOutputTypeGetPayload<S['include'][P]> :  never
  } 
    : 'select' extends U
    ? {
    [P in TrueKeys<S['select']>]:
        P extends 'Unit' ? UnitGetPayload<S['select'][P]> :
        P extends 'Guests' ? Array < GuestGetPayload<S['select'][P]>>  :
        P extends 'Message' ? Array < MessageGetPayload<S['select'][P]>>  :
        P extends '_count' ? RoomCountOutputTypeGetPayload<S['select'][P]> :  P extends keyof Room ? Room[P] : never
  } 
    : Room
  : Room


  type RoomCountArgs = Merge<
    Omit<RoomFindManyArgs, 'select' | 'include'> & {
      select?: RoomCountAggregateInputType | true
    }
  >

  export interface RoomDelegate<GlobalRejectSettings> {
    /**
     * Find zero or one Room that matches the filter.
     * @param {RoomFindUniqueArgs} args - Arguments to find a Room
     * @example
     * // Get one Room
     * const room = await prisma.room.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends RoomFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, RoomFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'Room'> extends True ? CheckSelect<T, Prisma__RoomClient<Room>, Prisma__RoomClient<RoomGetPayload<T>>> : CheckSelect<T, Prisma__RoomClient<Room | null >, Prisma__RoomClient<RoomGetPayload<T> | null >>

    /**
     * Find the first Room that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomFindFirstArgs} args - Arguments to find a Room
     * @example
     * // Get one Room
     * const room = await prisma.room.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends RoomFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, RoomFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'Room'> extends True ? CheckSelect<T, Prisma__RoomClient<Room>, Prisma__RoomClient<RoomGetPayload<T>>> : CheckSelect<T, Prisma__RoomClient<Room | null >, Prisma__RoomClient<RoomGetPayload<T> | null >>

    /**
     * Find zero or more Rooms that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Rooms
     * const rooms = await prisma.room.findMany()
     * 
     * // Get first 10 Rooms
     * const rooms = await prisma.room.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const roomWithIdOnly = await prisma.room.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends RoomFindManyArgs>(
      args?: SelectSubset<T, RoomFindManyArgs>
    ): CheckSelect<T, PrismaPromise<Array<Room>>, PrismaPromise<Array<RoomGetPayload<T>>>>

    /**
     * Create a Room.
     * @param {RoomCreateArgs} args - Arguments to create a Room.
     * @example
     * // Create one Room
     * const Room = await prisma.room.create({
     *   data: {
     *     // ... data to create a Room
     *   }
     * })
     * 
    **/
    create<T extends RoomCreateArgs>(
      args: SelectSubset<T, RoomCreateArgs>
    ): CheckSelect<T, Prisma__RoomClient<Room>, Prisma__RoomClient<RoomGetPayload<T>>>

    /**
     * Create many Rooms.
     *     @param {RoomCreateManyArgs} args - Arguments to create many Rooms.
     *     @example
     *     // Create many Rooms
     *     const room = await prisma.room.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends RoomCreateManyArgs>(
      args?: SelectSubset<T, RoomCreateManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Delete a Room.
     * @param {RoomDeleteArgs} args - Arguments to delete one Room.
     * @example
     * // Delete one Room
     * const Room = await prisma.room.delete({
     *   where: {
     *     // ... filter to delete one Room
     *   }
     * })
     * 
    **/
    delete<T extends RoomDeleteArgs>(
      args: SelectSubset<T, RoomDeleteArgs>
    ): CheckSelect<T, Prisma__RoomClient<Room>, Prisma__RoomClient<RoomGetPayload<T>>>

    /**
     * Update one Room.
     * @param {RoomUpdateArgs} args - Arguments to update one Room.
     * @example
     * // Update one Room
     * const room = await prisma.room.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends RoomUpdateArgs>(
      args: SelectSubset<T, RoomUpdateArgs>
    ): CheckSelect<T, Prisma__RoomClient<Room>, Prisma__RoomClient<RoomGetPayload<T>>>

    /**
     * Delete zero or more Rooms.
     * @param {RoomDeleteManyArgs} args - Arguments to filter Rooms to delete.
     * @example
     * // Delete a few Rooms
     * const { count } = await prisma.room.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends RoomDeleteManyArgs>(
      args?: SelectSubset<T, RoomDeleteManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Update zero or more Rooms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Rooms
     * const room = await prisma.room.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends RoomUpdateManyArgs>(
      args: SelectSubset<T, RoomUpdateManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Create or update one Room.
     * @param {RoomUpsertArgs} args - Arguments to update or create a Room.
     * @example
     * // Update or create a Room
     * const room = await prisma.room.upsert({
     *   create: {
     *     // ... data to create a Room
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Room we want to update
     *   }
     * })
    **/
    upsert<T extends RoomUpsertArgs>(
      args: SelectSubset<T, RoomUpsertArgs>
    ): CheckSelect<T, Prisma__RoomClient<Room>, Prisma__RoomClient<RoomGetPayload<T>>>

    /**
     * Find one Room that matches the filter or throw
     * `NotFoundError` if no matches were found.
     * @param {RoomFindUniqueOrThrowArgs} args - Arguments to find a Room
     * @example
     * // Get one Room
     * const room = await prisma.room.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends RoomFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, RoomFindUniqueOrThrowArgs>
    ): CheckSelect<T, Prisma__RoomClient<Room>, Prisma__RoomClient<RoomGetPayload<T>>>

    /**
     * Find the first Room that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomFindFirstOrThrowArgs} args - Arguments to find a Room
     * @example
     * // Get one Room
     * const room = await prisma.room.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends RoomFindFirstOrThrowArgs>(
      args?: SelectSubset<T, RoomFindFirstOrThrowArgs>
    ): CheckSelect<T, Prisma__RoomClient<Room>, Prisma__RoomClient<RoomGetPayload<T>>>

    /**
     * Count the number of Rooms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomCountArgs} args - Arguments to filter Rooms to count.
     * @example
     * // Count the number of Rooms
     * const count = await prisma.room.count({
     *   where: {
     *     // ... the filter for the Rooms we want to count
     *   }
     * })
    **/
    count<T extends RoomCountArgs>(
      args?: Subset<T, RoomCountArgs>,
    ): PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RoomCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Room.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RoomAggregateArgs>(args: Subset<T, RoomAggregateArgs>): PrismaPromise<GetRoomAggregateType<T>>

    /**
     * Group by Room.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoomGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RoomGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RoomGroupByArgs['orderBy'] }
        : { orderBy?: RoomGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RoomGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRoomGroupByPayload<T> : PrismaPromise<InputErrors>
  }

  /**
   * The delegate class that acts as a "Promise-like" for Room.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__RoomClient<T> implements PrismaPromise<T> {
    [prisma]: true;
    private readonly _dmmf;
    private readonly _fetcher;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    constructor(_dmmf: runtime.DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
    readonly [Symbol.toStringTag]: 'PrismaClientPromise';

    Unit<T extends UnitArgs = {}>(args?: Subset<T, UnitArgs>): CheckSelect<T, Prisma__UnitClient<Unit | null >, Prisma__UnitClient<UnitGetPayload<T> | null >>;

    Guests<T extends GuestFindManyArgs = {}>(args?: Subset<T, GuestFindManyArgs>): CheckSelect<T, PrismaPromise<Array<Guest>>, PrismaPromise<Array<GuestGetPayload<T>>>>;

    Message<T extends MessageFindManyArgs = {}>(args?: Subset<T, MessageFindManyArgs>): CheckSelect<T, PrismaPromise<Array<Message>>, PrismaPromise<Array<MessageGetPayload<T>>>>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }

  // Custom InputTypes

  /**
   * Room base type for findUnique actions
   */
  export type RoomFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the Room
     * 
    **/
    select?: RoomSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: RoomInclude | null
    /**
     * Filter, which Room to fetch.
     * 
    **/
    where: RoomWhereUniqueInput
  }

  /**
   * Room: findUnique
   */
  export interface RoomFindUniqueArgs extends RoomFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Room base type for findFirst actions
   */
  export type RoomFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the Room
     * 
    **/
    select?: RoomSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: RoomInclude | null
    /**
     * Filter, which Room to fetch.
     * 
    **/
    where?: RoomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rooms to fetch.
     * 
    **/
    orderBy?: Enumerable<RoomOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Rooms.
     * 
    **/
    cursor?: RoomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rooms from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rooms.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Rooms.
     * 
    **/
    distinct?: Enumerable<RoomScalarFieldEnum>
  }

  /**
   * Room: findFirst
   */
  export interface RoomFindFirstArgs extends RoomFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Room findMany
   */
  export type RoomFindManyArgs = {
    /**
     * Select specific fields to fetch from the Room
     * 
    **/
    select?: RoomSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: RoomInclude | null
    /**
     * Filter, which Rooms to fetch.
     * 
    **/
    where?: RoomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rooms to fetch.
     * 
    **/
    orderBy?: Enumerable<RoomOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Rooms.
     * 
    **/
    cursor?: RoomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rooms from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rooms.
     * 
    **/
    skip?: number
    distinct?: Enumerable<RoomScalarFieldEnum>
  }


  /**
   * Room create
   */
  export type RoomCreateArgs = {
    /**
     * Select specific fields to fetch from the Room
     * 
    **/
    select?: RoomSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: RoomInclude | null
    /**
     * The data needed to create a Room.
     * 
    **/
    data: XOR<RoomCreateInput, RoomUncheckedCreateInput>
  }


  /**
   * Room createMany
   */
  export type RoomCreateManyArgs = {
    /**
     * The data used to create many Rooms.
     * 
    **/
    data: Enumerable<RoomCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * Room update
   */
  export type RoomUpdateArgs = {
    /**
     * Select specific fields to fetch from the Room
     * 
    **/
    select?: RoomSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: RoomInclude | null
    /**
     * The data needed to update a Room.
     * 
    **/
    data: XOR<RoomUpdateInput, RoomUncheckedUpdateInput>
    /**
     * Choose, which Room to update.
     * 
    **/
    where: RoomWhereUniqueInput
  }


  /**
   * Room updateMany
   */
  export type RoomUpdateManyArgs = {
    /**
     * The data used to update Rooms.
     * 
    **/
    data: XOR<RoomUpdateManyMutationInput, RoomUncheckedUpdateManyInput>
    /**
     * Filter which Rooms to update
     * 
    **/
    where?: RoomWhereInput
  }


  /**
   * Room upsert
   */
  export type RoomUpsertArgs = {
    /**
     * Select specific fields to fetch from the Room
     * 
    **/
    select?: RoomSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: RoomInclude | null
    /**
     * The filter to search for the Room to update in case it exists.
     * 
    **/
    where: RoomWhereUniqueInput
    /**
     * In case the Room found by the `where` argument doesn't exist, create a new Room with this data.
     * 
    **/
    create: XOR<RoomCreateInput, RoomUncheckedCreateInput>
    /**
     * In case the Room was found with the provided `where` argument, update it with this data.
     * 
    **/
    update: XOR<RoomUpdateInput, RoomUncheckedUpdateInput>
  }


  /**
   * Room delete
   */
  export type RoomDeleteArgs = {
    /**
     * Select specific fields to fetch from the Room
     * 
    **/
    select?: RoomSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: RoomInclude | null
    /**
     * Filter which Room to delete.
     * 
    **/
    where: RoomWhereUniqueInput
  }


  /**
   * Room deleteMany
   */
  export type RoomDeleteManyArgs = {
    /**
     * Filter which Rooms to delete
     * 
    **/
    where?: RoomWhereInput
  }


  /**
   * Room: findUniqueOrThrow
   */
  export type RoomFindUniqueOrThrowArgs = RoomFindUniqueArgsBase
      

  /**
   * Room: findFirstOrThrow
   */
  export type RoomFindFirstOrThrowArgs = RoomFindFirstArgsBase
      

  /**
   * Room without action
   */
  export type RoomArgs = {
    /**
     * Select specific fields to fetch from the Room
     * 
    **/
    select?: RoomSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: RoomInclude | null
  }



  /**
   * Model Guest
   */


  export type AggregateGuest = {
    _count: GuestCountAggregateOutputType | null
    _avg: GuestAvgAggregateOutputType | null
    _sum: GuestSumAggregateOutputType | null
    _min: GuestMinAggregateOutputType | null
    _max: GuestMaxAggregateOutputType | null
  }

  export type GuestAvgAggregateOutputType = {
    id: number | null
  }

  export type GuestSumAggregateOutputType = {
    id: number | null
  }

  export type GuestMinAggregateOutputType = {
    id: number | null
    unitId: string | null
    roomId: string | null
    created: Date | null
  }

  export type GuestMaxAggregateOutputType = {
    id: number | null
    unitId: string | null
    roomId: string | null
    created: Date | null
  }

  export type GuestCountAggregateOutputType = {
    id: number
    unitId: number
    roomId: number
    created: number
    _all: number
  }


  export type GuestAvgAggregateInputType = {
    id?: true
  }

  export type GuestSumAggregateInputType = {
    id?: true
  }

  export type GuestMinAggregateInputType = {
    id?: true
    unitId?: true
    roomId?: true
    created?: true
  }

  export type GuestMaxAggregateInputType = {
    id?: true
    unitId?: true
    roomId?: true
    created?: true
  }

  export type GuestCountAggregateInputType = {
    id?: true
    unitId?: true
    roomId?: true
    created?: true
    _all?: true
  }

  export type GuestAggregateArgs = {
    /**
     * Filter which Guest to aggregate.
     * 
    **/
    where?: GuestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Guests to fetch.
     * 
    **/
    orderBy?: Enumerable<GuestOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     * 
    **/
    cursor?: GuestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Guests from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Guests.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Guests
    **/
    _count?: true | GuestCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GuestAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GuestSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GuestMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GuestMaxAggregateInputType
  }

  export type GetGuestAggregateType<T extends GuestAggregateArgs> = {
        [P in keyof T & keyof AggregateGuest]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGuest[P]>
      : GetScalarType<T[P], AggregateGuest[P]>
  }




  export type GuestGroupByArgs = {
    where?: GuestWhereInput
    orderBy?: Enumerable<GuestOrderByWithAggregationInput>
    by: Array<GuestScalarFieldEnum>
    having?: GuestScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GuestCountAggregateInputType | true
    _avg?: GuestAvgAggregateInputType
    _sum?: GuestSumAggregateInputType
    _min?: GuestMinAggregateInputType
    _max?: GuestMaxAggregateInputType
  }


  export type GuestGroupByOutputType = {
    id: number
    unitId: string
    roomId: string
    created: Date
    _count: GuestCountAggregateOutputType | null
    _avg: GuestAvgAggregateOutputType | null
    _sum: GuestSumAggregateOutputType | null
    _min: GuestMinAggregateOutputType | null
    _max: GuestMaxAggregateOutputType | null
  }

  type GetGuestGroupByPayload<T extends GuestGroupByArgs> = PrismaPromise<
    Array<
      PickArray<GuestGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GuestGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GuestGroupByOutputType[P]>
            : GetScalarType<T[P], GuestGroupByOutputType[P]>
        }
      >
    >


  export type GuestSelect = {
    id?: boolean
    unitId?: boolean
    roomId?: boolean
    Unit?: boolean | UnitArgs
    Room?: boolean | RoomArgs
    created?: boolean
  }

  export type GuestInclude = {
    Unit?: boolean | UnitArgs
    Room?: boolean | RoomArgs
  }

  export type GuestGetPayload<
    S extends boolean | null | undefined | GuestArgs,
    U = keyof S
      > = S extends true
        ? Guest
    : S extends undefined
    ? never
    : S extends GuestArgs | GuestFindManyArgs
    ?'include' extends U
    ? Guest  & {
    [P in TrueKeys<S['include']>]:
        P extends 'Unit' ? UnitGetPayload<S['include'][P]> :
        P extends 'Room' ? RoomGetPayload<S['include'][P]> :  never
  } 
    : 'select' extends U
    ? {
    [P in TrueKeys<S['select']>]:
        P extends 'Unit' ? UnitGetPayload<S['select'][P]> :
        P extends 'Room' ? RoomGetPayload<S['select'][P]> :  P extends keyof Guest ? Guest[P] : never
  } 
    : Guest
  : Guest


  type GuestCountArgs = Merge<
    Omit<GuestFindManyArgs, 'select' | 'include'> & {
      select?: GuestCountAggregateInputType | true
    }
  >

  export interface GuestDelegate<GlobalRejectSettings> {
    /**
     * Find zero or one Guest that matches the filter.
     * @param {GuestFindUniqueArgs} args - Arguments to find a Guest
     * @example
     * // Get one Guest
     * const guest = await prisma.guest.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends GuestFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, GuestFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'Guest'> extends True ? CheckSelect<T, Prisma__GuestClient<Guest>, Prisma__GuestClient<GuestGetPayload<T>>> : CheckSelect<T, Prisma__GuestClient<Guest | null >, Prisma__GuestClient<GuestGetPayload<T> | null >>

    /**
     * Find the first Guest that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuestFindFirstArgs} args - Arguments to find a Guest
     * @example
     * // Get one Guest
     * const guest = await prisma.guest.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends GuestFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, GuestFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'Guest'> extends True ? CheckSelect<T, Prisma__GuestClient<Guest>, Prisma__GuestClient<GuestGetPayload<T>>> : CheckSelect<T, Prisma__GuestClient<Guest | null >, Prisma__GuestClient<GuestGetPayload<T> | null >>

    /**
     * Find zero or more Guests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuestFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Guests
     * const guests = await prisma.guest.findMany()
     * 
     * // Get first 10 Guests
     * const guests = await prisma.guest.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const guestWithIdOnly = await prisma.guest.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends GuestFindManyArgs>(
      args?: SelectSubset<T, GuestFindManyArgs>
    ): CheckSelect<T, PrismaPromise<Array<Guest>>, PrismaPromise<Array<GuestGetPayload<T>>>>

    /**
     * Create a Guest.
     * @param {GuestCreateArgs} args - Arguments to create a Guest.
     * @example
     * // Create one Guest
     * const Guest = await prisma.guest.create({
     *   data: {
     *     // ... data to create a Guest
     *   }
     * })
     * 
    **/
    create<T extends GuestCreateArgs>(
      args: SelectSubset<T, GuestCreateArgs>
    ): CheckSelect<T, Prisma__GuestClient<Guest>, Prisma__GuestClient<GuestGetPayload<T>>>

    /**
     * Create many Guests.
     *     @param {GuestCreateManyArgs} args - Arguments to create many Guests.
     *     @example
     *     // Create many Guests
     *     const guest = await prisma.guest.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends GuestCreateManyArgs>(
      args?: SelectSubset<T, GuestCreateManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Delete a Guest.
     * @param {GuestDeleteArgs} args - Arguments to delete one Guest.
     * @example
     * // Delete one Guest
     * const Guest = await prisma.guest.delete({
     *   where: {
     *     // ... filter to delete one Guest
     *   }
     * })
     * 
    **/
    delete<T extends GuestDeleteArgs>(
      args: SelectSubset<T, GuestDeleteArgs>
    ): CheckSelect<T, Prisma__GuestClient<Guest>, Prisma__GuestClient<GuestGetPayload<T>>>

    /**
     * Update one Guest.
     * @param {GuestUpdateArgs} args - Arguments to update one Guest.
     * @example
     * // Update one Guest
     * const guest = await prisma.guest.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends GuestUpdateArgs>(
      args: SelectSubset<T, GuestUpdateArgs>
    ): CheckSelect<T, Prisma__GuestClient<Guest>, Prisma__GuestClient<GuestGetPayload<T>>>

    /**
     * Delete zero or more Guests.
     * @param {GuestDeleteManyArgs} args - Arguments to filter Guests to delete.
     * @example
     * // Delete a few Guests
     * const { count } = await prisma.guest.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends GuestDeleteManyArgs>(
      args?: SelectSubset<T, GuestDeleteManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Update zero or more Guests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuestUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Guests
     * const guest = await prisma.guest.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends GuestUpdateManyArgs>(
      args: SelectSubset<T, GuestUpdateManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Create or update one Guest.
     * @param {GuestUpsertArgs} args - Arguments to update or create a Guest.
     * @example
     * // Update or create a Guest
     * const guest = await prisma.guest.upsert({
     *   create: {
     *     // ... data to create a Guest
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Guest we want to update
     *   }
     * })
    **/
    upsert<T extends GuestUpsertArgs>(
      args: SelectSubset<T, GuestUpsertArgs>
    ): CheckSelect<T, Prisma__GuestClient<Guest>, Prisma__GuestClient<GuestGetPayload<T>>>

    /**
     * Find one Guest that matches the filter or throw
     * `NotFoundError` if no matches were found.
     * @param {GuestFindUniqueOrThrowArgs} args - Arguments to find a Guest
     * @example
     * // Get one Guest
     * const guest = await prisma.guest.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends GuestFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, GuestFindUniqueOrThrowArgs>
    ): CheckSelect<T, Prisma__GuestClient<Guest>, Prisma__GuestClient<GuestGetPayload<T>>>

    /**
     * Find the first Guest that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuestFindFirstOrThrowArgs} args - Arguments to find a Guest
     * @example
     * // Get one Guest
     * const guest = await prisma.guest.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends GuestFindFirstOrThrowArgs>(
      args?: SelectSubset<T, GuestFindFirstOrThrowArgs>
    ): CheckSelect<T, Prisma__GuestClient<Guest>, Prisma__GuestClient<GuestGetPayload<T>>>

    /**
     * Count the number of Guests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuestCountArgs} args - Arguments to filter Guests to count.
     * @example
     * // Count the number of Guests
     * const count = await prisma.guest.count({
     *   where: {
     *     // ... the filter for the Guests we want to count
     *   }
     * })
    **/
    count<T extends GuestCountArgs>(
      args?: Subset<T, GuestCountArgs>,
    ): PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GuestCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Guest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GuestAggregateArgs>(args: Subset<T, GuestAggregateArgs>): PrismaPromise<GetGuestAggregateType<T>>

    /**
     * Group by Guest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuestGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GuestGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GuestGroupByArgs['orderBy'] }
        : { orderBy?: GuestGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GuestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGuestGroupByPayload<T> : PrismaPromise<InputErrors>
  }

  /**
   * The delegate class that acts as a "Promise-like" for Guest.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__GuestClient<T> implements PrismaPromise<T> {
    [prisma]: true;
    private readonly _dmmf;
    private readonly _fetcher;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    constructor(_dmmf: runtime.DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
    readonly [Symbol.toStringTag]: 'PrismaClientPromise';

    Unit<T extends UnitArgs = {}>(args?: Subset<T, UnitArgs>): CheckSelect<T, Prisma__UnitClient<Unit | null >, Prisma__UnitClient<UnitGetPayload<T> | null >>;

    Room<T extends RoomArgs = {}>(args?: Subset<T, RoomArgs>): CheckSelect<T, Prisma__RoomClient<Room | null >, Prisma__RoomClient<RoomGetPayload<T> | null >>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }

  // Custom InputTypes

  /**
   * Guest base type for findUnique actions
   */
  export type GuestFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the Guest
     * 
    **/
    select?: GuestSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: GuestInclude | null
    /**
     * Filter, which Guest to fetch.
     * 
    **/
    where: GuestWhereUniqueInput
  }

  /**
   * Guest: findUnique
   */
  export interface GuestFindUniqueArgs extends GuestFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Guest base type for findFirst actions
   */
  export type GuestFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the Guest
     * 
    **/
    select?: GuestSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: GuestInclude | null
    /**
     * Filter, which Guest to fetch.
     * 
    **/
    where?: GuestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Guests to fetch.
     * 
    **/
    orderBy?: Enumerable<GuestOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Guests.
     * 
    **/
    cursor?: GuestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Guests from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Guests.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Guests.
     * 
    **/
    distinct?: Enumerable<GuestScalarFieldEnum>
  }

  /**
   * Guest: findFirst
   */
  export interface GuestFindFirstArgs extends GuestFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Guest findMany
   */
  export type GuestFindManyArgs = {
    /**
     * Select specific fields to fetch from the Guest
     * 
    **/
    select?: GuestSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: GuestInclude | null
    /**
     * Filter, which Guests to fetch.
     * 
    **/
    where?: GuestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Guests to fetch.
     * 
    **/
    orderBy?: Enumerable<GuestOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Guests.
     * 
    **/
    cursor?: GuestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Guests from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Guests.
     * 
    **/
    skip?: number
    distinct?: Enumerable<GuestScalarFieldEnum>
  }


  /**
   * Guest create
   */
  export type GuestCreateArgs = {
    /**
     * Select specific fields to fetch from the Guest
     * 
    **/
    select?: GuestSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: GuestInclude | null
    /**
     * The data needed to create a Guest.
     * 
    **/
    data: XOR<GuestCreateInput, GuestUncheckedCreateInput>
  }


  /**
   * Guest createMany
   */
  export type GuestCreateManyArgs = {
    /**
     * The data used to create many Guests.
     * 
    **/
    data: Enumerable<GuestCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * Guest update
   */
  export type GuestUpdateArgs = {
    /**
     * Select specific fields to fetch from the Guest
     * 
    **/
    select?: GuestSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: GuestInclude | null
    /**
     * The data needed to update a Guest.
     * 
    **/
    data: XOR<GuestUpdateInput, GuestUncheckedUpdateInput>
    /**
     * Choose, which Guest to update.
     * 
    **/
    where: GuestWhereUniqueInput
  }


  /**
   * Guest updateMany
   */
  export type GuestUpdateManyArgs = {
    /**
     * The data used to update Guests.
     * 
    **/
    data: XOR<GuestUpdateManyMutationInput, GuestUncheckedUpdateManyInput>
    /**
     * Filter which Guests to update
     * 
    **/
    where?: GuestWhereInput
  }


  /**
   * Guest upsert
   */
  export type GuestUpsertArgs = {
    /**
     * Select specific fields to fetch from the Guest
     * 
    **/
    select?: GuestSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: GuestInclude | null
    /**
     * The filter to search for the Guest to update in case it exists.
     * 
    **/
    where: GuestWhereUniqueInput
    /**
     * In case the Guest found by the `where` argument doesn't exist, create a new Guest with this data.
     * 
    **/
    create: XOR<GuestCreateInput, GuestUncheckedCreateInput>
    /**
     * In case the Guest was found with the provided `where` argument, update it with this data.
     * 
    **/
    update: XOR<GuestUpdateInput, GuestUncheckedUpdateInput>
  }


  /**
   * Guest delete
   */
  export type GuestDeleteArgs = {
    /**
     * Select specific fields to fetch from the Guest
     * 
    **/
    select?: GuestSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: GuestInclude | null
    /**
     * Filter which Guest to delete.
     * 
    **/
    where: GuestWhereUniqueInput
  }


  /**
   * Guest deleteMany
   */
  export type GuestDeleteManyArgs = {
    /**
     * Filter which Guests to delete
     * 
    **/
    where?: GuestWhereInput
  }


  /**
   * Guest: findUniqueOrThrow
   */
  export type GuestFindUniqueOrThrowArgs = GuestFindUniqueArgsBase
      

  /**
   * Guest: findFirstOrThrow
   */
  export type GuestFindFirstOrThrowArgs = GuestFindFirstArgsBase
      

  /**
   * Guest without action
   */
  export type GuestArgs = {
    /**
     * Select specific fields to fetch from the Guest
     * 
    **/
    select?: GuestSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: GuestInclude | null
  }



  /**
   * Model Message
   */


  export type AggregateMessage = {
    _count: MessageCountAggregateOutputType | null
    _avg: MessageAvgAggregateOutputType | null
    _sum: MessageSumAggregateOutputType | null
    _min: MessageMinAggregateOutputType | null
    _max: MessageMaxAggregateOutputType | null
  }

  export type MessageAvgAggregateOutputType = {
    id: number | null
  }

  export type MessageSumAggregateOutputType = {
    id: number | null
  }

  export type MessageMinAggregateOutputType = {
    id: number | null
    text: string | null
    unitId: string | null
    roomId: string | null
    updated: Date | null
    created: Date | null
  }

  export type MessageMaxAggregateOutputType = {
    id: number | null
    text: string | null
    unitId: string | null
    roomId: string | null
    updated: Date | null
    created: Date | null
  }

  export type MessageCountAggregateOutputType = {
    id: number
    text: number
    unitId: number
    roomId: number
    updated: number
    created: number
    _all: number
  }


  export type MessageAvgAggregateInputType = {
    id?: true
  }

  export type MessageSumAggregateInputType = {
    id?: true
  }

  export type MessageMinAggregateInputType = {
    id?: true
    text?: true
    unitId?: true
    roomId?: true
    updated?: true
    created?: true
  }

  export type MessageMaxAggregateInputType = {
    id?: true
    text?: true
    unitId?: true
    roomId?: true
    updated?: true
    created?: true
  }

  export type MessageCountAggregateInputType = {
    id?: true
    text?: true
    unitId?: true
    roomId?: true
    updated?: true
    created?: true
    _all?: true
  }

  export type MessageAggregateArgs = {
    /**
     * Filter which Message to aggregate.
     * 
    **/
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     * 
    **/
    orderBy?: Enumerable<MessageOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     * 
    **/
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Messages
    **/
    _count?: true | MessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MessageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MessageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MessageMaxAggregateInputType
  }

  export type GetMessageAggregateType<T extends MessageAggregateArgs> = {
        [P in keyof T & keyof AggregateMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMessage[P]>
      : GetScalarType<T[P], AggregateMessage[P]>
  }




  export type MessageGroupByArgs = {
    where?: MessageWhereInput
    orderBy?: Enumerable<MessageOrderByWithAggregationInput>
    by: Array<MessageScalarFieldEnum>
    having?: MessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MessageCountAggregateInputType | true
    _avg?: MessageAvgAggregateInputType
    _sum?: MessageSumAggregateInputType
    _min?: MessageMinAggregateInputType
    _max?: MessageMaxAggregateInputType
  }


  export type MessageGroupByOutputType = {
    id: number
    text: string
    unitId: string
    roomId: string
    updated: Date
    created: Date
    _count: MessageCountAggregateOutputType | null
    _avg: MessageAvgAggregateOutputType | null
    _sum: MessageSumAggregateOutputType | null
    _min: MessageMinAggregateOutputType | null
    _max: MessageMaxAggregateOutputType | null
  }

  type GetMessageGroupByPayload<T extends MessageGroupByArgs> = PrismaPromise<
    Array<
      PickArray<MessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MessageGroupByOutputType[P]>
            : GetScalarType<T[P], MessageGroupByOutputType[P]>
        }
      >
    >


  export type MessageSelect = {
    id?: boolean
    text?: boolean
    unitId?: boolean
    roomId?: boolean
    Unit?: boolean | UnitArgs
    Room?: boolean | RoomArgs
    updated?: boolean
    created?: boolean
  }

  export type MessageInclude = {
    Unit?: boolean | UnitArgs
    Room?: boolean | RoomArgs
  }

  export type MessageGetPayload<
    S extends boolean | null | undefined | MessageArgs,
    U = keyof S
      > = S extends true
        ? Message
    : S extends undefined
    ? never
    : S extends MessageArgs | MessageFindManyArgs
    ?'include' extends U
    ? Message  & {
    [P in TrueKeys<S['include']>]:
        P extends 'Unit' ? UnitGetPayload<S['include'][P]> :
        P extends 'Room' ? RoomGetPayload<S['include'][P]> :  never
  } 
    : 'select' extends U
    ? {
    [P in TrueKeys<S['select']>]:
        P extends 'Unit' ? UnitGetPayload<S['select'][P]> :
        P extends 'Room' ? RoomGetPayload<S['select'][P]> :  P extends keyof Message ? Message[P] : never
  } 
    : Message
  : Message


  type MessageCountArgs = Merge<
    Omit<MessageFindManyArgs, 'select' | 'include'> & {
      select?: MessageCountAggregateInputType | true
    }
  >

  export interface MessageDelegate<GlobalRejectSettings> {
    /**
     * Find zero or one Message that matches the filter.
     * @param {MessageFindUniqueArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends MessageFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, MessageFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'Message'> extends True ? CheckSelect<T, Prisma__MessageClient<Message>, Prisma__MessageClient<MessageGetPayload<T>>> : CheckSelect<T, Prisma__MessageClient<Message | null >, Prisma__MessageClient<MessageGetPayload<T> | null >>

    /**
     * Find the first Message that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageFindFirstArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends MessageFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, MessageFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'Message'> extends True ? CheckSelect<T, Prisma__MessageClient<Message>, Prisma__MessageClient<MessageGetPayload<T>>> : CheckSelect<T, Prisma__MessageClient<Message | null >, Prisma__MessageClient<MessageGetPayload<T> | null >>

    /**
     * Find zero or more Messages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Messages
     * const messages = await prisma.message.findMany()
     * 
     * // Get first 10 Messages
     * const messages = await prisma.message.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const messageWithIdOnly = await prisma.message.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends MessageFindManyArgs>(
      args?: SelectSubset<T, MessageFindManyArgs>
    ): CheckSelect<T, PrismaPromise<Array<Message>>, PrismaPromise<Array<MessageGetPayload<T>>>>

    /**
     * Create a Message.
     * @param {MessageCreateArgs} args - Arguments to create a Message.
     * @example
     * // Create one Message
     * const Message = await prisma.message.create({
     *   data: {
     *     // ... data to create a Message
     *   }
     * })
     * 
    **/
    create<T extends MessageCreateArgs>(
      args: SelectSubset<T, MessageCreateArgs>
    ): CheckSelect<T, Prisma__MessageClient<Message>, Prisma__MessageClient<MessageGetPayload<T>>>

    /**
     * Create many Messages.
     *     @param {MessageCreateManyArgs} args - Arguments to create many Messages.
     *     @example
     *     // Create many Messages
     *     const message = await prisma.message.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends MessageCreateManyArgs>(
      args?: SelectSubset<T, MessageCreateManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Delete a Message.
     * @param {MessageDeleteArgs} args - Arguments to delete one Message.
     * @example
     * // Delete one Message
     * const Message = await prisma.message.delete({
     *   where: {
     *     // ... filter to delete one Message
     *   }
     * })
     * 
    **/
    delete<T extends MessageDeleteArgs>(
      args: SelectSubset<T, MessageDeleteArgs>
    ): CheckSelect<T, Prisma__MessageClient<Message>, Prisma__MessageClient<MessageGetPayload<T>>>

    /**
     * Update one Message.
     * @param {MessageUpdateArgs} args - Arguments to update one Message.
     * @example
     * // Update one Message
     * const message = await prisma.message.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends MessageUpdateArgs>(
      args: SelectSubset<T, MessageUpdateArgs>
    ): CheckSelect<T, Prisma__MessageClient<Message>, Prisma__MessageClient<MessageGetPayload<T>>>

    /**
     * Delete zero or more Messages.
     * @param {MessageDeleteManyArgs} args - Arguments to filter Messages to delete.
     * @example
     * // Delete a few Messages
     * const { count } = await prisma.message.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends MessageDeleteManyArgs>(
      args?: SelectSubset<T, MessageDeleteManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Update zero or more Messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Messages
     * const message = await prisma.message.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends MessageUpdateManyArgs>(
      args: SelectSubset<T, MessageUpdateManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Create or update one Message.
     * @param {MessageUpsertArgs} args - Arguments to update or create a Message.
     * @example
     * // Update or create a Message
     * const message = await prisma.message.upsert({
     *   create: {
     *     // ... data to create a Message
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Message we want to update
     *   }
     * })
    **/
    upsert<T extends MessageUpsertArgs>(
      args: SelectSubset<T, MessageUpsertArgs>
    ): CheckSelect<T, Prisma__MessageClient<Message>, Prisma__MessageClient<MessageGetPayload<T>>>

    /**
     * Find one Message that matches the filter or throw
     * `NotFoundError` if no matches were found.
     * @param {MessageFindUniqueOrThrowArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends MessageFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, MessageFindUniqueOrThrowArgs>
    ): CheckSelect<T, Prisma__MessageClient<Message>, Prisma__MessageClient<MessageGetPayload<T>>>

    /**
     * Find the first Message that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageFindFirstOrThrowArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends MessageFindFirstOrThrowArgs>(
      args?: SelectSubset<T, MessageFindFirstOrThrowArgs>
    ): CheckSelect<T, Prisma__MessageClient<Message>, Prisma__MessageClient<MessageGetPayload<T>>>

    /**
     * Count the number of Messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageCountArgs} args - Arguments to filter Messages to count.
     * @example
     * // Count the number of Messages
     * const count = await prisma.message.count({
     *   where: {
     *     // ... the filter for the Messages we want to count
     *   }
     * })
    **/
    count<T extends MessageCountArgs>(
      args?: Subset<T, MessageCountArgs>,
    ): PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Message.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MessageAggregateArgs>(args: Subset<T, MessageAggregateArgs>): PrismaPromise<GetMessageAggregateType<T>>

    /**
     * Group by Message.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MessageGroupByArgs['orderBy'] }
        : { orderBy?: MessageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMessageGroupByPayload<T> : PrismaPromise<InputErrors>
  }

  /**
   * The delegate class that acts as a "Promise-like" for Message.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__MessageClient<T> implements PrismaPromise<T> {
    [prisma]: true;
    private readonly _dmmf;
    private readonly _fetcher;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    constructor(_dmmf: runtime.DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
    readonly [Symbol.toStringTag]: 'PrismaClientPromise';

    Unit<T extends UnitArgs = {}>(args?: Subset<T, UnitArgs>): CheckSelect<T, Prisma__UnitClient<Unit | null >, Prisma__UnitClient<UnitGetPayload<T> | null >>;

    Room<T extends RoomArgs = {}>(args?: Subset<T, RoomArgs>): CheckSelect<T, Prisma__RoomClient<Room | null >, Prisma__RoomClient<RoomGetPayload<T> | null >>;

    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }

  // Custom InputTypes

  /**
   * Message base type for findUnique actions
   */
  export type MessageFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the Message
     * 
    **/
    select?: MessageSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: MessageInclude | null
    /**
     * Filter, which Message to fetch.
     * 
    **/
    where: MessageWhereUniqueInput
  }

  /**
   * Message: findUnique
   */
  export interface MessageFindUniqueArgs extends MessageFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Message base type for findFirst actions
   */
  export type MessageFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the Message
     * 
    **/
    select?: MessageSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: MessageInclude | null
    /**
     * Filter, which Message to fetch.
     * 
    **/
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     * 
    **/
    orderBy?: Enumerable<MessageOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Messages.
     * 
    **/
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Messages.
     * 
    **/
    distinct?: Enumerable<MessageScalarFieldEnum>
  }

  /**
   * Message: findFirst
   */
  export interface MessageFindFirstArgs extends MessageFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Message findMany
   */
  export type MessageFindManyArgs = {
    /**
     * Select specific fields to fetch from the Message
     * 
    **/
    select?: MessageSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: MessageInclude | null
    /**
     * Filter, which Messages to fetch.
     * 
    **/
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     * 
    **/
    orderBy?: Enumerable<MessageOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Messages.
     * 
    **/
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     * 
    **/
    skip?: number
    distinct?: Enumerable<MessageScalarFieldEnum>
  }


  /**
   * Message create
   */
  export type MessageCreateArgs = {
    /**
     * Select specific fields to fetch from the Message
     * 
    **/
    select?: MessageSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: MessageInclude | null
    /**
     * The data needed to create a Message.
     * 
    **/
    data: XOR<MessageCreateInput, MessageUncheckedCreateInput>
  }


  /**
   * Message createMany
   */
  export type MessageCreateManyArgs = {
    /**
     * The data used to create many Messages.
     * 
    **/
    data: Enumerable<MessageCreateManyInput>
    skipDuplicates?: boolean
  }


  /**
   * Message update
   */
  export type MessageUpdateArgs = {
    /**
     * Select specific fields to fetch from the Message
     * 
    **/
    select?: MessageSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: MessageInclude | null
    /**
     * The data needed to update a Message.
     * 
    **/
    data: XOR<MessageUpdateInput, MessageUncheckedUpdateInput>
    /**
     * Choose, which Message to update.
     * 
    **/
    where: MessageWhereUniqueInput
  }


  /**
   * Message updateMany
   */
  export type MessageUpdateManyArgs = {
    /**
     * The data used to update Messages.
     * 
    **/
    data: XOR<MessageUpdateManyMutationInput, MessageUncheckedUpdateManyInput>
    /**
     * Filter which Messages to update
     * 
    **/
    where?: MessageWhereInput
  }


  /**
   * Message upsert
   */
  export type MessageUpsertArgs = {
    /**
     * Select specific fields to fetch from the Message
     * 
    **/
    select?: MessageSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: MessageInclude | null
    /**
     * The filter to search for the Message to update in case it exists.
     * 
    **/
    where: MessageWhereUniqueInput
    /**
     * In case the Message found by the `where` argument doesn't exist, create a new Message with this data.
     * 
    **/
    create: XOR<MessageCreateInput, MessageUncheckedCreateInput>
    /**
     * In case the Message was found with the provided `where` argument, update it with this data.
     * 
    **/
    update: XOR<MessageUpdateInput, MessageUncheckedUpdateInput>
  }


  /**
   * Message delete
   */
  export type MessageDeleteArgs = {
    /**
     * Select specific fields to fetch from the Message
     * 
    **/
    select?: MessageSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: MessageInclude | null
    /**
     * Filter which Message to delete.
     * 
    **/
    where: MessageWhereUniqueInput
  }


  /**
   * Message deleteMany
   */
  export type MessageDeleteManyArgs = {
    /**
     * Filter which Messages to delete
     * 
    **/
    where?: MessageWhereInput
  }


  /**
   * Message: findUniqueOrThrow
   */
  export type MessageFindUniqueOrThrowArgs = MessageFindUniqueArgsBase
      

  /**
   * Message: findFirstOrThrow
   */
  export type MessageFindFirstOrThrowArgs = MessageFindFirstArgsBase
      

  /**
   * Message without action
   */
  export type MessageArgs = {
    /**
     * Select specific fields to fetch from the Message
     * 
    **/
    select?: MessageSelect | null
    /**
     * Choose, which related nodes to fetch as well.
     * 
    **/
    include?: MessageInclude | null
  }



  /**
   * Enums
   */

  // Based on
  // https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275

  export const UnitScalarFieldEnum: {
    id: 'id',
    name: 'name',
    updated: 'updated',
    created: 'created'
  };

  export type UnitScalarFieldEnum = (typeof UnitScalarFieldEnum)[keyof typeof UnitScalarFieldEnum]


  export const RoomScalarFieldEnum: {
    id: 'id',
    authorId: 'authorId',
    archive: 'archive',
    updated: 'updated',
    created: 'created'
  };

  export type RoomScalarFieldEnum = (typeof RoomScalarFieldEnum)[keyof typeof RoomScalarFieldEnum]


  export const GuestScalarFieldEnum: {
    id: 'id',
    unitId: 'unitId',
    roomId: 'roomId',
    created: 'created'
  };

  export type GuestScalarFieldEnum = (typeof GuestScalarFieldEnum)[keyof typeof GuestScalarFieldEnum]


  export const MessageScalarFieldEnum: {
    id: 'id',
    text: 'text',
    unitId: 'unitId',
    roomId: 'roomId',
    updated: 'updated',
    created: 'created'
  };

  export type MessageScalarFieldEnum = (typeof MessageScalarFieldEnum)[keyof typeof MessageScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  /**
   * Deep Input Types
   */


  export type UnitWhereInput = {
    AND?: Enumerable<UnitWhereInput>
    OR?: Enumerable<UnitWhereInput>
    NOT?: Enumerable<UnitWhereInput>
    id?: StringFilter | string
    name?: StringNullableFilter | string | null
    updated?: DateTimeFilter | Date | string
    created?: DateTimeFilter | Date | string
    MyRooms?: RoomListRelationFilter
    IGuest?: GuestListRelationFilter
    Message?: MessageListRelationFilter
  }

  export type UnitOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    updated?: SortOrder
    created?: SortOrder
    MyRooms?: RoomOrderByRelationAggregateInput
    IGuest?: GuestOrderByRelationAggregateInput
    Message?: MessageOrderByRelationAggregateInput
  }

  export type UnitWhereUniqueInput = {
    id?: string
  }

  export type UnitOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    updated?: SortOrder
    created?: SortOrder
    _count?: UnitCountOrderByAggregateInput
    _max?: UnitMaxOrderByAggregateInput
    _min?: UnitMinOrderByAggregateInput
  }

  export type UnitScalarWhereWithAggregatesInput = {
    AND?: Enumerable<UnitScalarWhereWithAggregatesInput>
    OR?: Enumerable<UnitScalarWhereWithAggregatesInput>
    NOT?: Enumerable<UnitScalarWhereWithAggregatesInput>
    id?: StringWithAggregatesFilter | string
    name?: StringNullableWithAggregatesFilter | string | null
    updated?: DateTimeWithAggregatesFilter | Date | string
    created?: DateTimeWithAggregatesFilter | Date | string
  }

  export type RoomWhereInput = {
    AND?: Enumerable<RoomWhereInput>
    OR?: Enumerable<RoomWhereInput>
    NOT?: Enumerable<RoomWhereInput>
    id?: StringFilter | string
    authorId?: StringFilter | string
    Unit?: XOR<UnitRelationFilter, UnitWhereInput>
    archive?: BoolFilter | boolean
    updated?: DateTimeFilter | Date | string
    created?: DateTimeFilter | Date | string
    Guests?: GuestListRelationFilter
    Message?: MessageListRelationFilter
  }

  export type RoomOrderByWithRelationInput = {
    id?: SortOrder
    authorId?: SortOrder
    Unit?: UnitOrderByWithRelationInput
    archive?: SortOrder
    updated?: SortOrder
    created?: SortOrder
    Guests?: GuestOrderByRelationAggregateInput
    Message?: MessageOrderByRelationAggregateInput
  }

  export type RoomWhereUniqueInput = {
    id?: string
  }

  export type RoomOrderByWithAggregationInput = {
    id?: SortOrder
    authorId?: SortOrder
    archive?: SortOrder
    updated?: SortOrder
    created?: SortOrder
    _count?: RoomCountOrderByAggregateInput
    _max?: RoomMaxOrderByAggregateInput
    _min?: RoomMinOrderByAggregateInput
  }

  export type RoomScalarWhereWithAggregatesInput = {
    AND?: Enumerable<RoomScalarWhereWithAggregatesInput>
    OR?: Enumerable<RoomScalarWhereWithAggregatesInput>
    NOT?: Enumerable<RoomScalarWhereWithAggregatesInput>
    id?: StringWithAggregatesFilter | string
    authorId?: StringWithAggregatesFilter | string
    archive?: BoolWithAggregatesFilter | boolean
    updated?: DateTimeWithAggregatesFilter | Date | string
    created?: DateTimeWithAggregatesFilter | Date | string
  }

  export type GuestWhereInput = {
    AND?: Enumerable<GuestWhereInput>
    OR?: Enumerable<GuestWhereInput>
    NOT?: Enumerable<GuestWhereInput>
    id?: IntFilter | number
    unitId?: StringFilter | string
    roomId?: StringFilter | string
    Unit?: XOR<UnitRelationFilter, UnitWhereInput>
    Room?: XOR<RoomRelationFilter, RoomWhereInput>
    created?: DateTimeFilter | Date | string
  }

  export type GuestOrderByWithRelationInput = {
    id?: SortOrder
    unitId?: SortOrder
    roomId?: SortOrder
    Unit?: UnitOrderByWithRelationInput
    Room?: RoomOrderByWithRelationInput
    created?: SortOrder
  }

  export type GuestWhereUniqueInput = {
    id?: number
    unitId_roomId?: GuestUnitIdRoomIdCompoundUniqueInput
  }

  export type GuestOrderByWithAggregationInput = {
    id?: SortOrder
    unitId?: SortOrder
    roomId?: SortOrder
    created?: SortOrder
    _count?: GuestCountOrderByAggregateInput
    _avg?: GuestAvgOrderByAggregateInput
    _max?: GuestMaxOrderByAggregateInput
    _min?: GuestMinOrderByAggregateInput
    _sum?: GuestSumOrderByAggregateInput
  }

  export type GuestScalarWhereWithAggregatesInput = {
    AND?: Enumerable<GuestScalarWhereWithAggregatesInput>
    OR?: Enumerable<GuestScalarWhereWithAggregatesInput>
    NOT?: Enumerable<GuestScalarWhereWithAggregatesInput>
    id?: IntWithAggregatesFilter | number
    unitId?: StringWithAggregatesFilter | string
    roomId?: StringWithAggregatesFilter | string
    created?: DateTimeWithAggregatesFilter | Date | string
  }

  export type MessageWhereInput = {
    AND?: Enumerable<MessageWhereInput>
    OR?: Enumerable<MessageWhereInput>
    NOT?: Enumerable<MessageWhereInput>
    id?: IntFilter | number
    text?: StringFilter | string
    unitId?: StringFilter | string
    roomId?: StringFilter | string
    Unit?: XOR<UnitRelationFilter, UnitWhereInput>
    Room?: XOR<RoomRelationFilter, RoomWhereInput>
    updated?: DateTimeFilter | Date | string
    created?: DateTimeFilter | Date | string
  }

  export type MessageOrderByWithRelationInput = {
    id?: SortOrder
    text?: SortOrder
    unitId?: SortOrder
    roomId?: SortOrder
    Unit?: UnitOrderByWithRelationInput
    Room?: RoomOrderByWithRelationInput
    updated?: SortOrder
    created?: SortOrder
  }

  export type MessageWhereUniqueInput = {
    id?: number
  }

  export type MessageOrderByWithAggregationInput = {
    id?: SortOrder
    text?: SortOrder
    unitId?: SortOrder
    roomId?: SortOrder
    updated?: SortOrder
    created?: SortOrder
    _count?: MessageCountOrderByAggregateInput
    _avg?: MessageAvgOrderByAggregateInput
    _max?: MessageMaxOrderByAggregateInput
    _min?: MessageMinOrderByAggregateInput
    _sum?: MessageSumOrderByAggregateInput
  }

  export type MessageScalarWhereWithAggregatesInput = {
    AND?: Enumerable<MessageScalarWhereWithAggregatesInput>
    OR?: Enumerable<MessageScalarWhereWithAggregatesInput>
    NOT?: Enumerable<MessageScalarWhereWithAggregatesInput>
    id?: IntWithAggregatesFilter | number
    text?: StringWithAggregatesFilter | string
    unitId?: StringWithAggregatesFilter | string
    roomId?: StringWithAggregatesFilter | string
    updated?: DateTimeWithAggregatesFilter | Date | string
    created?: DateTimeWithAggregatesFilter | Date | string
  }

  export type UnitCreateInput = {
    id: string
    name?: string | null
    updated?: Date | string
    created?: Date | string
    MyRooms?: RoomCreateNestedManyWithoutUnitInput
    IGuest?: GuestCreateNestedManyWithoutUnitInput
    Message?: MessageCreateNestedManyWithoutUnitInput
  }

  export type UnitUncheckedCreateInput = {
    id: string
    name?: string | null
    updated?: Date | string
    created?: Date | string
    MyRooms?: RoomUncheckedCreateNestedManyWithoutUnitInput
    IGuest?: GuestUncheckedCreateNestedManyWithoutUnitInput
    Message?: MessageUncheckedCreateNestedManyWithoutUnitInput
  }

  export type UnitUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
    MyRooms?: RoomUpdateManyWithoutUnitNestedInput
    IGuest?: GuestUpdateManyWithoutUnitNestedInput
    Message?: MessageUpdateManyWithoutUnitNestedInput
  }

  export type UnitUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
    MyRooms?: RoomUncheckedUpdateManyWithoutUnitNestedInput
    IGuest?: GuestUncheckedUpdateManyWithoutUnitNestedInput
    Message?: MessageUncheckedUpdateManyWithoutUnitNestedInput
  }

  export type UnitCreateManyInput = {
    id: string
    name?: string | null
    updated?: Date | string
    created?: Date | string
  }

  export type UnitUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UnitUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoomCreateInput = {
    id: string
    Unit: UnitCreateNestedOneWithoutMyRoomsInput
    archive?: boolean
    updated?: Date | string
    created?: Date | string
    Guests?: GuestCreateNestedManyWithoutRoomInput
    Message?: MessageCreateNestedManyWithoutRoomInput
  }

  export type RoomUncheckedCreateInput = {
    id: string
    authorId: string
    archive?: boolean
    updated?: Date | string
    created?: Date | string
    Guests?: GuestUncheckedCreateNestedManyWithoutRoomInput
    Message?: MessageUncheckedCreateNestedManyWithoutRoomInput
  }

  export type RoomUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    Unit?: UnitUpdateOneRequiredWithoutMyRoomsNestedInput
    archive?: BoolFieldUpdateOperationsInput | boolean
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
    Guests?: GuestUpdateManyWithoutRoomNestedInput
    Message?: MessageUpdateManyWithoutRoomNestedInput
  }

  export type RoomUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    archive?: BoolFieldUpdateOperationsInput | boolean
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
    Guests?: GuestUncheckedUpdateManyWithoutRoomNestedInput
    Message?: MessageUncheckedUpdateManyWithoutRoomNestedInput
  }

  export type RoomCreateManyInput = {
    id: string
    authorId: string
    archive?: boolean
    updated?: Date | string
    created?: Date | string
  }

  export type RoomUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    archive?: BoolFieldUpdateOperationsInput | boolean
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoomUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    archive?: BoolFieldUpdateOperationsInput | boolean
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GuestCreateInput = {
    Unit: UnitCreateNestedOneWithoutIGuestInput
    Room: RoomCreateNestedOneWithoutGuestsInput
    created?: Date | string
  }

  export type GuestUncheckedCreateInput = {
    id?: number
    unitId: string
    roomId: string
    created?: Date | string
  }

  export type GuestUpdateInput = {
    Unit?: UnitUpdateOneRequiredWithoutIGuestNestedInput
    Room?: RoomUpdateOneRequiredWithoutGuestsNestedInput
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GuestUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    unitId?: StringFieldUpdateOperationsInput | string
    roomId?: StringFieldUpdateOperationsInput | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GuestCreateManyInput = {
    id?: number
    unitId: string
    roomId: string
    created?: Date | string
  }

  export type GuestUpdateManyMutationInput = {
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GuestUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    unitId?: StringFieldUpdateOperationsInput | string
    roomId?: StringFieldUpdateOperationsInput | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MessageCreateInput = {
    text: string
    Unit: UnitCreateNestedOneWithoutMessageInput
    Room: RoomCreateNestedOneWithoutMessageInput
    updated?: Date | string
    created?: Date | string
  }

  export type MessageUncheckedCreateInput = {
    id?: number
    text: string
    unitId: string
    roomId: string
    updated?: Date | string
    created?: Date | string
  }

  export type MessageUpdateInput = {
    text?: StringFieldUpdateOperationsInput | string
    Unit?: UnitUpdateOneRequiredWithoutMessageNestedInput
    Room?: RoomUpdateOneRequiredWithoutMessageNestedInput
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MessageUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    text?: StringFieldUpdateOperationsInput | string
    unitId?: StringFieldUpdateOperationsInput | string
    roomId?: StringFieldUpdateOperationsInput | string
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MessageCreateManyInput = {
    id?: number
    text: string
    unitId: string
    roomId: string
    updated?: Date | string
    created?: Date | string
  }

  export type MessageUpdateManyMutationInput = {
    text?: StringFieldUpdateOperationsInput | string
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MessageUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    text?: StringFieldUpdateOperationsInput | string
    unitId?: StringFieldUpdateOperationsInput | string
    roomId?: StringFieldUpdateOperationsInput | string
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter = {
    equals?: string
    in?: Enumerable<string>
    notIn?: Enumerable<string>
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringFilter | string
  }

  export type StringNullableFilter = {
    equals?: string | null
    in?: Enumerable<string> | null
    notIn?: Enumerable<string> | null
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringNullableFilter | string | null
  }

  export type DateTimeFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string>
    notIn?: Enumerable<Date> | Enumerable<string>
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeFilter | Date | string
  }

  export type RoomListRelationFilter = {
    every?: RoomWhereInput
    some?: RoomWhereInput
    none?: RoomWhereInput
  }

  export type GuestListRelationFilter = {
    every?: GuestWhereInput
    some?: GuestWhereInput
    none?: GuestWhereInput
  }

  export type MessageListRelationFilter = {
    every?: MessageWhereInput
    some?: MessageWhereInput
    none?: MessageWhereInput
  }

  export type RoomOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GuestOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MessageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UnitCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    updated?: SortOrder
    created?: SortOrder
  }

  export type UnitMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    updated?: SortOrder
    created?: SortOrder
  }

  export type UnitMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    updated?: SortOrder
    created?: SortOrder
  }

  export type StringWithAggregatesFilter = {
    equals?: string
    in?: Enumerable<string>
    notIn?: Enumerable<string>
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringWithAggregatesFilter | string
    _count?: NestedIntFilter
    _min?: NestedStringFilter
    _max?: NestedStringFilter
  }

  export type StringNullableWithAggregatesFilter = {
    equals?: string | null
    in?: Enumerable<string> | null
    notIn?: Enumerable<string> | null
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringNullableWithAggregatesFilter | string | null
    _count?: NestedIntNullableFilter
    _min?: NestedStringNullableFilter
    _max?: NestedStringNullableFilter
  }

  export type DateTimeWithAggregatesFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string>
    notIn?: Enumerable<Date> | Enumerable<string>
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeWithAggregatesFilter | Date | string
    _count?: NestedIntFilter
    _min?: NestedDateTimeFilter
    _max?: NestedDateTimeFilter
  }

  export type UnitRelationFilter = {
    is?: UnitWhereInput
    isNot?: UnitWhereInput
  }

  export type BoolFilter = {
    equals?: boolean
    not?: NestedBoolFilter | boolean
  }

  export type RoomCountOrderByAggregateInput = {
    id?: SortOrder
    authorId?: SortOrder
    archive?: SortOrder
    updated?: SortOrder
    created?: SortOrder
  }

  export type RoomMaxOrderByAggregateInput = {
    id?: SortOrder
    authorId?: SortOrder
    archive?: SortOrder
    updated?: SortOrder
    created?: SortOrder
  }

  export type RoomMinOrderByAggregateInput = {
    id?: SortOrder
    authorId?: SortOrder
    archive?: SortOrder
    updated?: SortOrder
    created?: SortOrder
  }

  export type BoolWithAggregatesFilter = {
    equals?: boolean
    not?: NestedBoolWithAggregatesFilter | boolean
    _count?: NestedIntFilter
    _min?: NestedBoolFilter
    _max?: NestedBoolFilter
  }

  export type IntFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntFilter | number
  }

  export type RoomRelationFilter = {
    is?: RoomWhereInput
    isNot?: RoomWhereInput
  }

  export type GuestUnitIdRoomIdCompoundUniqueInput = {
    unitId: string
    roomId: string
  }

  export type GuestCountOrderByAggregateInput = {
    id?: SortOrder
    unitId?: SortOrder
    roomId?: SortOrder
    created?: SortOrder
  }

  export type GuestAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type GuestMaxOrderByAggregateInput = {
    id?: SortOrder
    unitId?: SortOrder
    roomId?: SortOrder
    created?: SortOrder
  }

  export type GuestMinOrderByAggregateInput = {
    id?: SortOrder
    unitId?: SortOrder
    roomId?: SortOrder
    created?: SortOrder
  }

  export type GuestSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntWithAggregatesFilter | number
    _count?: NestedIntFilter
    _avg?: NestedFloatFilter
    _sum?: NestedIntFilter
    _min?: NestedIntFilter
    _max?: NestedIntFilter
  }

  export type MessageCountOrderByAggregateInput = {
    id?: SortOrder
    text?: SortOrder
    unitId?: SortOrder
    roomId?: SortOrder
    updated?: SortOrder
    created?: SortOrder
  }

  export type MessageAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type MessageMaxOrderByAggregateInput = {
    id?: SortOrder
    text?: SortOrder
    unitId?: SortOrder
    roomId?: SortOrder
    updated?: SortOrder
    created?: SortOrder
  }

  export type MessageMinOrderByAggregateInput = {
    id?: SortOrder
    text?: SortOrder
    unitId?: SortOrder
    roomId?: SortOrder
    updated?: SortOrder
    created?: SortOrder
  }

  export type MessageSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type RoomCreateNestedManyWithoutUnitInput = {
    create?: XOR<Enumerable<RoomCreateWithoutUnitInput>, Enumerable<RoomUncheckedCreateWithoutUnitInput>>
    connectOrCreate?: Enumerable<RoomCreateOrConnectWithoutUnitInput>
    createMany?: RoomCreateManyUnitInputEnvelope
    connect?: Enumerable<RoomWhereUniqueInput>
  }

  export type GuestCreateNestedManyWithoutUnitInput = {
    create?: XOR<Enumerable<GuestCreateWithoutUnitInput>, Enumerable<GuestUncheckedCreateWithoutUnitInput>>
    connectOrCreate?: Enumerable<GuestCreateOrConnectWithoutUnitInput>
    createMany?: GuestCreateManyUnitInputEnvelope
    connect?: Enumerable<GuestWhereUniqueInput>
  }

  export type MessageCreateNestedManyWithoutUnitInput = {
    create?: XOR<Enumerable<MessageCreateWithoutUnitInput>, Enumerable<MessageUncheckedCreateWithoutUnitInput>>
    connectOrCreate?: Enumerable<MessageCreateOrConnectWithoutUnitInput>
    createMany?: MessageCreateManyUnitInputEnvelope
    connect?: Enumerable<MessageWhereUniqueInput>
  }

  export type RoomUncheckedCreateNestedManyWithoutUnitInput = {
    create?: XOR<Enumerable<RoomCreateWithoutUnitInput>, Enumerable<RoomUncheckedCreateWithoutUnitInput>>
    connectOrCreate?: Enumerable<RoomCreateOrConnectWithoutUnitInput>
    createMany?: RoomCreateManyUnitInputEnvelope
    connect?: Enumerable<RoomWhereUniqueInput>
  }

  export type GuestUncheckedCreateNestedManyWithoutUnitInput = {
    create?: XOR<Enumerable<GuestCreateWithoutUnitInput>, Enumerable<GuestUncheckedCreateWithoutUnitInput>>
    connectOrCreate?: Enumerable<GuestCreateOrConnectWithoutUnitInput>
    createMany?: GuestCreateManyUnitInputEnvelope
    connect?: Enumerable<GuestWhereUniqueInput>
  }

  export type MessageUncheckedCreateNestedManyWithoutUnitInput = {
    create?: XOR<Enumerable<MessageCreateWithoutUnitInput>, Enumerable<MessageUncheckedCreateWithoutUnitInput>>
    connectOrCreate?: Enumerable<MessageCreateOrConnectWithoutUnitInput>
    createMany?: MessageCreateManyUnitInputEnvelope
    connect?: Enumerable<MessageWhereUniqueInput>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type RoomUpdateManyWithoutUnitNestedInput = {
    create?: XOR<Enumerable<RoomCreateWithoutUnitInput>, Enumerable<RoomUncheckedCreateWithoutUnitInput>>
    connectOrCreate?: Enumerable<RoomCreateOrConnectWithoutUnitInput>
    upsert?: Enumerable<RoomUpsertWithWhereUniqueWithoutUnitInput>
    createMany?: RoomCreateManyUnitInputEnvelope
    set?: Enumerable<RoomWhereUniqueInput>
    disconnect?: Enumerable<RoomWhereUniqueInput>
    delete?: Enumerable<RoomWhereUniqueInput>
    connect?: Enumerable<RoomWhereUniqueInput>
    update?: Enumerable<RoomUpdateWithWhereUniqueWithoutUnitInput>
    updateMany?: Enumerable<RoomUpdateManyWithWhereWithoutUnitInput>
    deleteMany?: Enumerable<RoomScalarWhereInput>
  }

  export type GuestUpdateManyWithoutUnitNestedInput = {
    create?: XOR<Enumerable<GuestCreateWithoutUnitInput>, Enumerable<GuestUncheckedCreateWithoutUnitInput>>
    connectOrCreate?: Enumerable<GuestCreateOrConnectWithoutUnitInput>
    upsert?: Enumerable<GuestUpsertWithWhereUniqueWithoutUnitInput>
    createMany?: GuestCreateManyUnitInputEnvelope
    set?: Enumerable<GuestWhereUniqueInput>
    disconnect?: Enumerable<GuestWhereUniqueInput>
    delete?: Enumerable<GuestWhereUniqueInput>
    connect?: Enumerable<GuestWhereUniqueInput>
    update?: Enumerable<GuestUpdateWithWhereUniqueWithoutUnitInput>
    updateMany?: Enumerable<GuestUpdateManyWithWhereWithoutUnitInput>
    deleteMany?: Enumerable<GuestScalarWhereInput>
  }

  export type MessageUpdateManyWithoutUnitNestedInput = {
    create?: XOR<Enumerable<MessageCreateWithoutUnitInput>, Enumerable<MessageUncheckedCreateWithoutUnitInput>>
    connectOrCreate?: Enumerable<MessageCreateOrConnectWithoutUnitInput>
    upsert?: Enumerable<MessageUpsertWithWhereUniqueWithoutUnitInput>
    createMany?: MessageCreateManyUnitInputEnvelope
    set?: Enumerable<MessageWhereUniqueInput>
    disconnect?: Enumerable<MessageWhereUniqueInput>
    delete?: Enumerable<MessageWhereUniqueInput>
    connect?: Enumerable<MessageWhereUniqueInput>
    update?: Enumerable<MessageUpdateWithWhereUniqueWithoutUnitInput>
    updateMany?: Enumerable<MessageUpdateManyWithWhereWithoutUnitInput>
    deleteMany?: Enumerable<MessageScalarWhereInput>
  }

  export type RoomUncheckedUpdateManyWithoutUnitNestedInput = {
    create?: XOR<Enumerable<RoomCreateWithoutUnitInput>, Enumerable<RoomUncheckedCreateWithoutUnitInput>>
    connectOrCreate?: Enumerable<RoomCreateOrConnectWithoutUnitInput>
    upsert?: Enumerable<RoomUpsertWithWhereUniqueWithoutUnitInput>
    createMany?: RoomCreateManyUnitInputEnvelope
    set?: Enumerable<RoomWhereUniqueInput>
    disconnect?: Enumerable<RoomWhereUniqueInput>
    delete?: Enumerable<RoomWhereUniqueInput>
    connect?: Enumerable<RoomWhereUniqueInput>
    update?: Enumerable<RoomUpdateWithWhereUniqueWithoutUnitInput>
    updateMany?: Enumerable<RoomUpdateManyWithWhereWithoutUnitInput>
    deleteMany?: Enumerable<RoomScalarWhereInput>
  }

  export type GuestUncheckedUpdateManyWithoutUnitNestedInput = {
    create?: XOR<Enumerable<GuestCreateWithoutUnitInput>, Enumerable<GuestUncheckedCreateWithoutUnitInput>>
    connectOrCreate?: Enumerable<GuestCreateOrConnectWithoutUnitInput>
    upsert?: Enumerable<GuestUpsertWithWhereUniqueWithoutUnitInput>
    createMany?: GuestCreateManyUnitInputEnvelope
    set?: Enumerable<GuestWhereUniqueInput>
    disconnect?: Enumerable<GuestWhereUniqueInput>
    delete?: Enumerable<GuestWhereUniqueInput>
    connect?: Enumerable<GuestWhereUniqueInput>
    update?: Enumerable<GuestUpdateWithWhereUniqueWithoutUnitInput>
    updateMany?: Enumerable<GuestUpdateManyWithWhereWithoutUnitInput>
    deleteMany?: Enumerable<GuestScalarWhereInput>
  }

  export type MessageUncheckedUpdateManyWithoutUnitNestedInput = {
    create?: XOR<Enumerable<MessageCreateWithoutUnitInput>, Enumerable<MessageUncheckedCreateWithoutUnitInput>>
    connectOrCreate?: Enumerable<MessageCreateOrConnectWithoutUnitInput>
    upsert?: Enumerable<MessageUpsertWithWhereUniqueWithoutUnitInput>
    createMany?: MessageCreateManyUnitInputEnvelope
    set?: Enumerable<MessageWhereUniqueInput>
    disconnect?: Enumerable<MessageWhereUniqueInput>
    delete?: Enumerable<MessageWhereUniqueInput>
    connect?: Enumerable<MessageWhereUniqueInput>
    update?: Enumerable<MessageUpdateWithWhereUniqueWithoutUnitInput>
    updateMany?: Enumerable<MessageUpdateManyWithWhereWithoutUnitInput>
    deleteMany?: Enumerable<MessageScalarWhereInput>
  }

  export type UnitCreateNestedOneWithoutMyRoomsInput = {
    create?: XOR<UnitCreateWithoutMyRoomsInput, UnitUncheckedCreateWithoutMyRoomsInput>
    connectOrCreate?: UnitCreateOrConnectWithoutMyRoomsInput
    connect?: UnitWhereUniqueInput
  }

  export type GuestCreateNestedManyWithoutRoomInput = {
    create?: XOR<Enumerable<GuestCreateWithoutRoomInput>, Enumerable<GuestUncheckedCreateWithoutRoomInput>>
    connectOrCreate?: Enumerable<GuestCreateOrConnectWithoutRoomInput>
    createMany?: GuestCreateManyRoomInputEnvelope
    connect?: Enumerable<GuestWhereUniqueInput>
  }

  export type MessageCreateNestedManyWithoutRoomInput = {
    create?: XOR<Enumerable<MessageCreateWithoutRoomInput>, Enumerable<MessageUncheckedCreateWithoutRoomInput>>
    connectOrCreate?: Enumerable<MessageCreateOrConnectWithoutRoomInput>
    createMany?: MessageCreateManyRoomInputEnvelope
    connect?: Enumerable<MessageWhereUniqueInput>
  }

  export type GuestUncheckedCreateNestedManyWithoutRoomInput = {
    create?: XOR<Enumerable<GuestCreateWithoutRoomInput>, Enumerable<GuestUncheckedCreateWithoutRoomInput>>
    connectOrCreate?: Enumerable<GuestCreateOrConnectWithoutRoomInput>
    createMany?: GuestCreateManyRoomInputEnvelope
    connect?: Enumerable<GuestWhereUniqueInput>
  }

  export type MessageUncheckedCreateNestedManyWithoutRoomInput = {
    create?: XOR<Enumerable<MessageCreateWithoutRoomInput>, Enumerable<MessageUncheckedCreateWithoutRoomInput>>
    connectOrCreate?: Enumerable<MessageCreateOrConnectWithoutRoomInput>
    createMany?: MessageCreateManyRoomInputEnvelope
    connect?: Enumerable<MessageWhereUniqueInput>
  }

  export type UnitUpdateOneRequiredWithoutMyRoomsNestedInput = {
    create?: XOR<UnitCreateWithoutMyRoomsInput, UnitUncheckedCreateWithoutMyRoomsInput>
    connectOrCreate?: UnitCreateOrConnectWithoutMyRoomsInput
    upsert?: UnitUpsertWithoutMyRoomsInput
    connect?: UnitWhereUniqueInput
    update?: XOR<UnitUpdateWithoutMyRoomsInput, UnitUncheckedUpdateWithoutMyRoomsInput>
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type GuestUpdateManyWithoutRoomNestedInput = {
    create?: XOR<Enumerable<GuestCreateWithoutRoomInput>, Enumerable<GuestUncheckedCreateWithoutRoomInput>>
    connectOrCreate?: Enumerable<GuestCreateOrConnectWithoutRoomInput>
    upsert?: Enumerable<GuestUpsertWithWhereUniqueWithoutRoomInput>
    createMany?: GuestCreateManyRoomInputEnvelope
    set?: Enumerable<GuestWhereUniqueInput>
    disconnect?: Enumerable<GuestWhereUniqueInput>
    delete?: Enumerable<GuestWhereUniqueInput>
    connect?: Enumerable<GuestWhereUniqueInput>
    update?: Enumerable<GuestUpdateWithWhereUniqueWithoutRoomInput>
    updateMany?: Enumerable<GuestUpdateManyWithWhereWithoutRoomInput>
    deleteMany?: Enumerable<GuestScalarWhereInput>
  }

  export type MessageUpdateManyWithoutRoomNestedInput = {
    create?: XOR<Enumerable<MessageCreateWithoutRoomInput>, Enumerable<MessageUncheckedCreateWithoutRoomInput>>
    connectOrCreate?: Enumerable<MessageCreateOrConnectWithoutRoomInput>
    upsert?: Enumerable<MessageUpsertWithWhereUniqueWithoutRoomInput>
    createMany?: MessageCreateManyRoomInputEnvelope
    set?: Enumerable<MessageWhereUniqueInput>
    disconnect?: Enumerable<MessageWhereUniqueInput>
    delete?: Enumerable<MessageWhereUniqueInput>
    connect?: Enumerable<MessageWhereUniqueInput>
    update?: Enumerable<MessageUpdateWithWhereUniqueWithoutRoomInput>
    updateMany?: Enumerable<MessageUpdateManyWithWhereWithoutRoomInput>
    deleteMany?: Enumerable<MessageScalarWhereInput>
  }

  export type GuestUncheckedUpdateManyWithoutRoomNestedInput = {
    create?: XOR<Enumerable<GuestCreateWithoutRoomInput>, Enumerable<GuestUncheckedCreateWithoutRoomInput>>
    connectOrCreate?: Enumerable<GuestCreateOrConnectWithoutRoomInput>
    upsert?: Enumerable<GuestUpsertWithWhereUniqueWithoutRoomInput>
    createMany?: GuestCreateManyRoomInputEnvelope
    set?: Enumerable<GuestWhereUniqueInput>
    disconnect?: Enumerable<GuestWhereUniqueInput>
    delete?: Enumerable<GuestWhereUniqueInput>
    connect?: Enumerable<GuestWhereUniqueInput>
    update?: Enumerable<GuestUpdateWithWhereUniqueWithoutRoomInput>
    updateMany?: Enumerable<GuestUpdateManyWithWhereWithoutRoomInput>
    deleteMany?: Enumerable<GuestScalarWhereInput>
  }

  export type MessageUncheckedUpdateManyWithoutRoomNestedInput = {
    create?: XOR<Enumerable<MessageCreateWithoutRoomInput>, Enumerable<MessageUncheckedCreateWithoutRoomInput>>
    connectOrCreate?: Enumerable<MessageCreateOrConnectWithoutRoomInput>
    upsert?: Enumerable<MessageUpsertWithWhereUniqueWithoutRoomInput>
    createMany?: MessageCreateManyRoomInputEnvelope
    set?: Enumerable<MessageWhereUniqueInput>
    disconnect?: Enumerable<MessageWhereUniqueInput>
    delete?: Enumerable<MessageWhereUniqueInput>
    connect?: Enumerable<MessageWhereUniqueInput>
    update?: Enumerable<MessageUpdateWithWhereUniqueWithoutRoomInput>
    updateMany?: Enumerable<MessageUpdateManyWithWhereWithoutRoomInput>
    deleteMany?: Enumerable<MessageScalarWhereInput>
  }

  export type UnitCreateNestedOneWithoutIGuestInput = {
    create?: XOR<UnitCreateWithoutIGuestInput, UnitUncheckedCreateWithoutIGuestInput>
    connectOrCreate?: UnitCreateOrConnectWithoutIGuestInput
    connect?: UnitWhereUniqueInput
  }

  export type RoomCreateNestedOneWithoutGuestsInput = {
    create?: XOR<RoomCreateWithoutGuestsInput, RoomUncheckedCreateWithoutGuestsInput>
    connectOrCreate?: RoomCreateOrConnectWithoutGuestsInput
    connect?: RoomWhereUniqueInput
  }

  export type UnitUpdateOneRequiredWithoutIGuestNestedInput = {
    create?: XOR<UnitCreateWithoutIGuestInput, UnitUncheckedCreateWithoutIGuestInput>
    connectOrCreate?: UnitCreateOrConnectWithoutIGuestInput
    upsert?: UnitUpsertWithoutIGuestInput
    connect?: UnitWhereUniqueInput
    update?: XOR<UnitUpdateWithoutIGuestInput, UnitUncheckedUpdateWithoutIGuestInput>
  }

  export type RoomUpdateOneRequiredWithoutGuestsNestedInput = {
    create?: XOR<RoomCreateWithoutGuestsInput, RoomUncheckedCreateWithoutGuestsInput>
    connectOrCreate?: RoomCreateOrConnectWithoutGuestsInput
    upsert?: RoomUpsertWithoutGuestsInput
    connect?: RoomWhereUniqueInput
    update?: XOR<RoomUpdateWithoutGuestsInput, RoomUncheckedUpdateWithoutGuestsInput>
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UnitCreateNestedOneWithoutMessageInput = {
    create?: XOR<UnitCreateWithoutMessageInput, UnitUncheckedCreateWithoutMessageInput>
    connectOrCreate?: UnitCreateOrConnectWithoutMessageInput
    connect?: UnitWhereUniqueInput
  }

  export type RoomCreateNestedOneWithoutMessageInput = {
    create?: XOR<RoomCreateWithoutMessageInput, RoomUncheckedCreateWithoutMessageInput>
    connectOrCreate?: RoomCreateOrConnectWithoutMessageInput
    connect?: RoomWhereUniqueInput
  }

  export type UnitUpdateOneRequiredWithoutMessageNestedInput = {
    create?: XOR<UnitCreateWithoutMessageInput, UnitUncheckedCreateWithoutMessageInput>
    connectOrCreate?: UnitCreateOrConnectWithoutMessageInput
    upsert?: UnitUpsertWithoutMessageInput
    connect?: UnitWhereUniqueInput
    update?: XOR<UnitUpdateWithoutMessageInput, UnitUncheckedUpdateWithoutMessageInput>
  }

  export type RoomUpdateOneRequiredWithoutMessageNestedInput = {
    create?: XOR<RoomCreateWithoutMessageInput, RoomUncheckedCreateWithoutMessageInput>
    connectOrCreate?: RoomCreateOrConnectWithoutMessageInput
    upsert?: RoomUpsertWithoutMessageInput
    connect?: RoomWhereUniqueInput
    update?: XOR<RoomUpdateWithoutMessageInput, RoomUncheckedUpdateWithoutMessageInput>
  }

  export type NestedStringFilter = {
    equals?: string
    in?: Enumerable<string>
    notIn?: Enumerable<string>
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringFilter | string
  }

  export type NestedStringNullableFilter = {
    equals?: string | null
    in?: Enumerable<string> | null
    notIn?: Enumerable<string> | null
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringNullableFilter | string | null
  }

  export type NestedDateTimeFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string>
    notIn?: Enumerable<Date> | Enumerable<string>
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeFilter | Date | string
  }

  export type NestedStringWithAggregatesFilter = {
    equals?: string
    in?: Enumerable<string>
    notIn?: Enumerable<string>
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringWithAggregatesFilter | string
    _count?: NestedIntFilter
    _min?: NestedStringFilter
    _max?: NestedStringFilter
  }

  export type NestedIntFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntFilter | number
  }

  export type NestedStringNullableWithAggregatesFilter = {
    equals?: string | null
    in?: Enumerable<string> | null
    notIn?: Enumerable<string> | null
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringNullableWithAggregatesFilter | string | null
    _count?: NestedIntNullableFilter
    _min?: NestedStringNullableFilter
    _max?: NestedStringNullableFilter
  }

  export type NestedIntNullableFilter = {
    equals?: number | null
    in?: Enumerable<number> | null
    notIn?: Enumerable<number> | null
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntNullableFilter | number | null
  }

  export type NestedDateTimeWithAggregatesFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string>
    notIn?: Enumerable<Date> | Enumerable<string>
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeWithAggregatesFilter | Date | string
    _count?: NestedIntFilter
    _min?: NestedDateTimeFilter
    _max?: NestedDateTimeFilter
  }

  export type NestedBoolFilter = {
    equals?: boolean
    not?: NestedBoolFilter | boolean
  }

  export type NestedBoolWithAggregatesFilter = {
    equals?: boolean
    not?: NestedBoolWithAggregatesFilter | boolean
    _count?: NestedIntFilter
    _min?: NestedBoolFilter
    _max?: NestedBoolFilter
  }

  export type NestedIntWithAggregatesFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntWithAggregatesFilter | number
    _count?: NestedIntFilter
    _avg?: NestedFloatFilter
    _sum?: NestedIntFilter
    _min?: NestedIntFilter
    _max?: NestedIntFilter
  }

  export type NestedFloatFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedFloatFilter | number
  }

  export type RoomCreateWithoutUnitInput = {
    id: string
    archive?: boolean
    updated?: Date | string
    created?: Date | string
    Guests?: GuestCreateNestedManyWithoutRoomInput
    Message?: MessageCreateNestedManyWithoutRoomInput
  }

  export type RoomUncheckedCreateWithoutUnitInput = {
    id: string
    archive?: boolean
    updated?: Date | string
    created?: Date | string
    Guests?: GuestUncheckedCreateNestedManyWithoutRoomInput
    Message?: MessageUncheckedCreateNestedManyWithoutRoomInput
  }

  export type RoomCreateOrConnectWithoutUnitInput = {
    where: RoomWhereUniqueInput
    create: XOR<RoomCreateWithoutUnitInput, RoomUncheckedCreateWithoutUnitInput>
  }

  export type RoomCreateManyUnitInputEnvelope = {
    data: Enumerable<RoomCreateManyUnitInput>
    skipDuplicates?: boolean
  }

  export type GuestCreateWithoutUnitInput = {
    Room: RoomCreateNestedOneWithoutGuestsInput
    created?: Date | string
  }

  export type GuestUncheckedCreateWithoutUnitInput = {
    id?: number
    roomId: string
    created?: Date | string
  }

  export type GuestCreateOrConnectWithoutUnitInput = {
    where: GuestWhereUniqueInput
    create: XOR<GuestCreateWithoutUnitInput, GuestUncheckedCreateWithoutUnitInput>
  }

  export type GuestCreateManyUnitInputEnvelope = {
    data: Enumerable<GuestCreateManyUnitInput>
    skipDuplicates?: boolean
  }

  export type MessageCreateWithoutUnitInput = {
    text: string
    Room: RoomCreateNestedOneWithoutMessageInput
    updated?: Date | string
    created?: Date | string
  }

  export type MessageUncheckedCreateWithoutUnitInput = {
    id?: number
    text: string
    roomId: string
    updated?: Date | string
    created?: Date | string
  }

  export type MessageCreateOrConnectWithoutUnitInput = {
    where: MessageWhereUniqueInput
    create: XOR<MessageCreateWithoutUnitInput, MessageUncheckedCreateWithoutUnitInput>
  }

  export type MessageCreateManyUnitInputEnvelope = {
    data: Enumerable<MessageCreateManyUnitInput>
    skipDuplicates?: boolean
  }

  export type RoomUpsertWithWhereUniqueWithoutUnitInput = {
    where: RoomWhereUniqueInput
    update: XOR<RoomUpdateWithoutUnitInput, RoomUncheckedUpdateWithoutUnitInput>
    create: XOR<RoomCreateWithoutUnitInput, RoomUncheckedCreateWithoutUnitInput>
  }

  export type RoomUpdateWithWhereUniqueWithoutUnitInput = {
    where: RoomWhereUniqueInput
    data: XOR<RoomUpdateWithoutUnitInput, RoomUncheckedUpdateWithoutUnitInput>
  }

  export type RoomUpdateManyWithWhereWithoutUnitInput = {
    where: RoomScalarWhereInput
    data: XOR<RoomUpdateManyMutationInput, RoomUncheckedUpdateManyWithoutMyRoomsInput>
  }

  export type RoomScalarWhereInput = {
    AND?: Enumerable<RoomScalarWhereInput>
    OR?: Enumerable<RoomScalarWhereInput>
    NOT?: Enumerable<RoomScalarWhereInput>
    id?: StringFilter | string
    authorId?: StringFilter | string
    archive?: BoolFilter | boolean
    updated?: DateTimeFilter | Date | string
    created?: DateTimeFilter | Date | string
  }

  export type GuestUpsertWithWhereUniqueWithoutUnitInput = {
    where: GuestWhereUniqueInput
    update: XOR<GuestUpdateWithoutUnitInput, GuestUncheckedUpdateWithoutUnitInput>
    create: XOR<GuestCreateWithoutUnitInput, GuestUncheckedCreateWithoutUnitInput>
  }

  export type GuestUpdateWithWhereUniqueWithoutUnitInput = {
    where: GuestWhereUniqueInput
    data: XOR<GuestUpdateWithoutUnitInput, GuestUncheckedUpdateWithoutUnitInput>
  }

  export type GuestUpdateManyWithWhereWithoutUnitInput = {
    where: GuestScalarWhereInput
    data: XOR<GuestUpdateManyMutationInput, GuestUncheckedUpdateManyWithoutIGuestInput>
  }

  export type GuestScalarWhereInput = {
    AND?: Enumerable<GuestScalarWhereInput>
    OR?: Enumerable<GuestScalarWhereInput>
    NOT?: Enumerable<GuestScalarWhereInput>
    id?: IntFilter | number
    unitId?: StringFilter | string
    roomId?: StringFilter | string
    created?: DateTimeFilter | Date | string
  }

  export type MessageUpsertWithWhereUniqueWithoutUnitInput = {
    where: MessageWhereUniqueInput
    update: XOR<MessageUpdateWithoutUnitInput, MessageUncheckedUpdateWithoutUnitInput>
    create: XOR<MessageCreateWithoutUnitInput, MessageUncheckedCreateWithoutUnitInput>
  }

  export type MessageUpdateWithWhereUniqueWithoutUnitInput = {
    where: MessageWhereUniqueInput
    data: XOR<MessageUpdateWithoutUnitInput, MessageUncheckedUpdateWithoutUnitInput>
  }

  export type MessageUpdateManyWithWhereWithoutUnitInput = {
    where: MessageScalarWhereInput
    data: XOR<MessageUpdateManyMutationInput, MessageUncheckedUpdateManyWithoutMessageInput>
  }

  export type MessageScalarWhereInput = {
    AND?: Enumerable<MessageScalarWhereInput>
    OR?: Enumerable<MessageScalarWhereInput>
    NOT?: Enumerable<MessageScalarWhereInput>
    id?: IntFilter | number
    text?: StringFilter | string
    unitId?: StringFilter | string
    roomId?: StringFilter | string
    updated?: DateTimeFilter | Date | string
    created?: DateTimeFilter | Date | string
  }

  export type UnitCreateWithoutMyRoomsInput = {
    id: string
    name?: string | null
    updated?: Date | string
    created?: Date | string
    IGuest?: GuestCreateNestedManyWithoutUnitInput
    Message?: MessageCreateNestedManyWithoutUnitInput
  }

  export type UnitUncheckedCreateWithoutMyRoomsInput = {
    id: string
    name?: string | null
    updated?: Date | string
    created?: Date | string
    IGuest?: GuestUncheckedCreateNestedManyWithoutUnitInput
    Message?: MessageUncheckedCreateNestedManyWithoutUnitInput
  }

  export type UnitCreateOrConnectWithoutMyRoomsInput = {
    where: UnitWhereUniqueInput
    create: XOR<UnitCreateWithoutMyRoomsInput, UnitUncheckedCreateWithoutMyRoomsInput>
  }

  export type GuestCreateWithoutRoomInput = {
    Unit: UnitCreateNestedOneWithoutIGuestInput
    created?: Date | string
  }

  export type GuestUncheckedCreateWithoutRoomInput = {
    id?: number
    unitId: string
    created?: Date | string
  }

  export type GuestCreateOrConnectWithoutRoomInput = {
    where: GuestWhereUniqueInput
    create: XOR<GuestCreateWithoutRoomInput, GuestUncheckedCreateWithoutRoomInput>
  }

  export type GuestCreateManyRoomInputEnvelope = {
    data: Enumerable<GuestCreateManyRoomInput>
    skipDuplicates?: boolean
  }

  export type MessageCreateWithoutRoomInput = {
    text: string
    Unit: UnitCreateNestedOneWithoutMessageInput
    updated?: Date | string
    created?: Date | string
  }

  export type MessageUncheckedCreateWithoutRoomInput = {
    id?: number
    text: string
    unitId: string
    updated?: Date | string
    created?: Date | string
  }

  export type MessageCreateOrConnectWithoutRoomInput = {
    where: MessageWhereUniqueInput
    create: XOR<MessageCreateWithoutRoomInput, MessageUncheckedCreateWithoutRoomInput>
  }

  export type MessageCreateManyRoomInputEnvelope = {
    data: Enumerable<MessageCreateManyRoomInput>
    skipDuplicates?: boolean
  }

  export type UnitUpsertWithoutMyRoomsInput = {
    update: XOR<UnitUpdateWithoutMyRoomsInput, UnitUncheckedUpdateWithoutMyRoomsInput>
    create: XOR<UnitCreateWithoutMyRoomsInput, UnitUncheckedCreateWithoutMyRoomsInput>
  }

  export type UnitUpdateWithoutMyRoomsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
    IGuest?: GuestUpdateManyWithoutUnitNestedInput
    Message?: MessageUpdateManyWithoutUnitNestedInput
  }

  export type UnitUncheckedUpdateWithoutMyRoomsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
    IGuest?: GuestUncheckedUpdateManyWithoutUnitNestedInput
    Message?: MessageUncheckedUpdateManyWithoutUnitNestedInput
  }

  export type GuestUpsertWithWhereUniqueWithoutRoomInput = {
    where: GuestWhereUniqueInput
    update: XOR<GuestUpdateWithoutRoomInput, GuestUncheckedUpdateWithoutRoomInput>
    create: XOR<GuestCreateWithoutRoomInput, GuestUncheckedCreateWithoutRoomInput>
  }

  export type GuestUpdateWithWhereUniqueWithoutRoomInput = {
    where: GuestWhereUniqueInput
    data: XOR<GuestUpdateWithoutRoomInput, GuestUncheckedUpdateWithoutRoomInput>
  }

  export type GuestUpdateManyWithWhereWithoutRoomInput = {
    where: GuestScalarWhereInput
    data: XOR<GuestUpdateManyMutationInput, GuestUncheckedUpdateManyWithoutGuestsInput>
  }

  export type MessageUpsertWithWhereUniqueWithoutRoomInput = {
    where: MessageWhereUniqueInput
    update: XOR<MessageUpdateWithoutRoomInput, MessageUncheckedUpdateWithoutRoomInput>
    create: XOR<MessageCreateWithoutRoomInput, MessageUncheckedCreateWithoutRoomInput>
  }

  export type MessageUpdateWithWhereUniqueWithoutRoomInput = {
    where: MessageWhereUniqueInput
    data: XOR<MessageUpdateWithoutRoomInput, MessageUncheckedUpdateWithoutRoomInput>
  }

  export type MessageUpdateManyWithWhereWithoutRoomInput = {
    where: MessageScalarWhereInput
    data: XOR<MessageUpdateManyMutationInput, MessageUncheckedUpdateManyWithoutMessageInput>
  }

  export type UnitCreateWithoutIGuestInput = {
    id: string
    name?: string | null
    updated?: Date | string
    created?: Date | string
    MyRooms?: RoomCreateNestedManyWithoutUnitInput
    Message?: MessageCreateNestedManyWithoutUnitInput
  }

  export type UnitUncheckedCreateWithoutIGuestInput = {
    id: string
    name?: string | null
    updated?: Date | string
    created?: Date | string
    MyRooms?: RoomUncheckedCreateNestedManyWithoutUnitInput
    Message?: MessageUncheckedCreateNestedManyWithoutUnitInput
  }

  export type UnitCreateOrConnectWithoutIGuestInput = {
    where: UnitWhereUniqueInput
    create: XOR<UnitCreateWithoutIGuestInput, UnitUncheckedCreateWithoutIGuestInput>
  }

  export type RoomCreateWithoutGuestsInput = {
    id: string
    Unit: UnitCreateNestedOneWithoutMyRoomsInput
    archive?: boolean
    updated?: Date | string
    created?: Date | string
    Message?: MessageCreateNestedManyWithoutRoomInput
  }

  export type RoomUncheckedCreateWithoutGuestsInput = {
    id: string
    authorId: string
    archive?: boolean
    updated?: Date | string
    created?: Date | string
    Message?: MessageUncheckedCreateNestedManyWithoutRoomInput
  }

  export type RoomCreateOrConnectWithoutGuestsInput = {
    where: RoomWhereUniqueInput
    create: XOR<RoomCreateWithoutGuestsInput, RoomUncheckedCreateWithoutGuestsInput>
  }

  export type UnitUpsertWithoutIGuestInput = {
    update: XOR<UnitUpdateWithoutIGuestInput, UnitUncheckedUpdateWithoutIGuestInput>
    create: XOR<UnitCreateWithoutIGuestInput, UnitUncheckedCreateWithoutIGuestInput>
  }

  export type UnitUpdateWithoutIGuestInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
    MyRooms?: RoomUpdateManyWithoutUnitNestedInput
    Message?: MessageUpdateManyWithoutUnitNestedInput
  }

  export type UnitUncheckedUpdateWithoutIGuestInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
    MyRooms?: RoomUncheckedUpdateManyWithoutUnitNestedInput
    Message?: MessageUncheckedUpdateManyWithoutUnitNestedInput
  }

  export type RoomUpsertWithoutGuestsInput = {
    update: XOR<RoomUpdateWithoutGuestsInput, RoomUncheckedUpdateWithoutGuestsInput>
    create: XOR<RoomCreateWithoutGuestsInput, RoomUncheckedCreateWithoutGuestsInput>
  }

  export type RoomUpdateWithoutGuestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    Unit?: UnitUpdateOneRequiredWithoutMyRoomsNestedInput
    archive?: BoolFieldUpdateOperationsInput | boolean
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
    Message?: MessageUpdateManyWithoutRoomNestedInput
  }

  export type RoomUncheckedUpdateWithoutGuestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    archive?: BoolFieldUpdateOperationsInput | boolean
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
    Message?: MessageUncheckedUpdateManyWithoutRoomNestedInput
  }

  export type UnitCreateWithoutMessageInput = {
    id: string
    name?: string | null
    updated?: Date | string
    created?: Date | string
    MyRooms?: RoomCreateNestedManyWithoutUnitInput
    IGuest?: GuestCreateNestedManyWithoutUnitInput
  }

  export type UnitUncheckedCreateWithoutMessageInput = {
    id: string
    name?: string | null
    updated?: Date | string
    created?: Date | string
    MyRooms?: RoomUncheckedCreateNestedManyWithoutUnitInput
    IGuest?: GuestUncheckedCreateNestedManyWithoutUnitInput
  }

  export type UnitCreateOrConnectWithoutMessageInput = {
    where: UnitWhereUniqueInput
    create: XOR<UnitCreateWithoutMessageInput, UnitUncheckedCreateWithoutMessageInput>
  }

  export type RoomCreateWithoutMessageInput = {
    id: string
    Unit: UnitCreateNestedOneWithoutMyRoomsInput
    archive?: boolean
    updated?: Date | string
    created?: Date | string
    Guests?: GuestCreateNestedManyWithoutRoomInput
  }

  export type RoomUncheckedCreateWithoutMessageInput = {
    id: string
    authorId: string
    archive?: boolean
    updated?: Date | string
    created?: Date | string
    Guests?: GuestUncheckedCreateNestedManyWithoutRoomInput
  }

  export type RoomCreateOrConnectWithoutMessageInput = {
    where: RoomWhereUniqueInput
    create: XOR<RoomCreateWithoutMessageInput, RoomUncheckedCreateWithoutMessageInput>
  }

  export type UnitUpsertWithoutMessageInput = {
    update: XOR<UnitUpdateWithoutMessageInput, UnitUncheckedUpdateWithoutMessageInput>
    create: XOR<UnitCreateWithoutMessageInput, UnitUncheckedCreateWithoutMessageInput>
  }

  export type UnitUpdateWithoutMessageInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
    MyRooms?: RoomUpdateManyWithoutUnitNestedInput
    IGuest?: GuestUpdateManyWithoutUnitNestedInput
  }

  export type UnitUncheckedUpdateWithoutMessageInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
    MyRooms?: RoomUncheckedUpdateManyWithoutUnitNestedInput
    IGuest?: GuestUncheckedUpdateManyWithoutUnitNestedInput
  }

  export type RoomUpsertWithoutMessageInput = {
    update: XOR<RoomUpdateWithoutMessageInput, RoomUncheckedUpdateWithoutMessageInput>
    create: XOR<RoomCreateWithoutMessageInput, RoomUncheckedCreateWithoutMessageInput>
  }

  export type RoomUpdateWithoutMessageInput = {
    id?: StringFieldUpdateOperationsInput | string
    Unit?: UnitUpdateOneRequiredWithoutMyRoomsNestedInput
    archive?: BoolFieldUpdateOperationsInput | boolean
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
    Guests?: GuestUpdateManyWithoutRoomNestedInput
  }

  export type RoomUncheckedUpdateWithoutMessageInput = {
    id?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    archive?: BoolFieldUpdateOperationsInput | boolean
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
    Guests?: GuestUncheckedUpdateManyWithoutRoomNestedInput
  }

  export type RoomCreateManyUnitInput = {
    id: string
    archive?: boolean
    updated?: Date | string
    created?: Date | string
  }

  export type GuestCreateManyUnitInput = {
    id?: number
    roomId: string
    created?: Date | string
  }

  export type MessageCreateManyUnitInput = {
    id?: number
    text: string
    roomId: string
    updated?: Date | string
    created?: Date | string
  }

  export type RoomUpdateWithoutUnitInput = {
    id?: StringFieldUpdateOperationsInput | string
    archive?: BoolFieldUpdateOperationsInput | boolean
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
    Guests?: GuestUpdateManyWithoutRoomNestedInput
    Message?: MessageUpdateManyWithoutRoomNestedInput
  }

  export type RoomUncheckedUpdateWithoutUnitInput = {
    id?: StringFieldUpdateOperationsInput | string
    archive?: BoolFieldUpdateOperationsInput | boolean
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
    Guests?: GuestUncheckedUpdateManyWithoutRoomNestedInput
    Message?: MessageUncheckedUpdateManyWithoutRoomNestedInput
  }

  export type RoomUncheckedUpdateManyWithoutMyRoomsInput = {
    id?: StringFieldUpdateOperationsInput | string
    archive?: BoolFieldUpdateOperationsInput | boolean
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GuestUpdateWithoutUnitInput = {
    Room?: RoomUpdateOneRequiredWithoutGuestsNestedInput
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GuestUncheckedUpdateWithoutUnitInput = {
    id?: IntFieldUpdateOperationsInput | number
    roomId?: StringFieldUpdateOperationsInput | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GuestUncheckedUpdateManyWithoutIGuestInput = {
    id?: IntFieldUpdateOperationsInput | number
    roomId?: StringFieldUpdateOperationsInput | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MessageUpdateWithoutUnitInput = {
    text?: StringFieldUpdateOperationsInput | string
    Room?: RoomUpdateOneRequiredWithoutMessageNestedInput
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MessageUncheckedUpdateWithoutUnitInput = {
    id?: IntFieldUpdateOperationsInput | number
    text?: StringFieldUpdateOperationsInput | string
    roomId?: StringFieldUpdateOperationsInput | string
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MessageUncheckedUpdateManyWithoutMessageInput = {
    id?: IntFieldUpdateOperationsInput | number
    text?: StringFieldUpdateOperationsInput | string
    roomId?: StringFieldUpdateOperationsInput | string
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GuestCreateManyRoomInput = {
    id?: number
    unitId: string
    created?: Date | string
  }

  export type MessageCreateManyRoomInput = {
    id?: number
    text: string
    unitId: string
    updated?: Date | string
    created?: Date | string
  }

  export type GuestUpdateWithoutRoomInput = {
    Unit?: UnitUpdateOneRequiredWithoutIGuestNestedInput
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GuestUncheckedUpdateWithoutRoomInput = {
    id?: IntFieldUpdateOperationsInput | number
    unitId?: StringFieldUpdateOperationsInput | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GuestUncheckedUpdateManyWithoutGuestsInput = {
    id?: IntFieldUpdateOperationsInput | number
    unitId?: StringFieldUpdateOperationsInput | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MessageUpdateWithoutRoomInput = {
    text?: StringFieldUpdateOperationsInput | string
    Unit?: UnitUpdateOneRequiredWithoutMessageNestedInput
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MessageUncheckedUpdateWithoutRoomInput = {
    id?: IntFieldUpdateOperationsInput | number
    text?: StringFieldUpdateOperationsInput | string
    unitId?: StringFieldUpdateOperationsInput | string
    updated?: DateTimeFieldUpdateOperationsInput | Date | string
    created?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}