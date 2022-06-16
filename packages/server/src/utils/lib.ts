// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const log = (type: 'info' | 'warn' | 'error', text: string, data?: any) => {
  const Red = '\x1b[31m';
  const Reset = '\x1b[0m';
  const Bright = '\x1b[1m';
  const Yellow = '\x1b[33m';
  const Dim = '\x1b[2m';
  console[type](
    new Date(),
    type === 'error' ? Red : type === 'warn' ? Yellow : Bright,
    type,
    Reset,
    text,
    Dim,
    data,
    Reset
  );
};

export const compareNumbers = (id: number, userId: number, item: number) =>
  `${id}-${userId}-${item}`;
