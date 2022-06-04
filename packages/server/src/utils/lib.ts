export const log = (type: 'info' | 'warn' | 'error', text: string, data?: any) => {
  console[type](type, text, data);
};

export const getUserId = () => new Date().getTime();
