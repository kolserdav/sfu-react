export const getRoomLink = (roomId: number | string | null): string | null => {
  let res = null;
  if (typeof window !== 'undefined' && roomId) {
    res = `${window.location.href.replace(/\?.*/, '')}?d=${new Date().getTime()}`;
  }
  return res;
};

export const getPathname = (): string | null => {
  let res = null;
  if (typeof window !== 'undefined') {
    res = window.location.pathname;
  }
  return res;
};
