export const createStreams = (
  strArr: { stream: MediaStream; userId: number }[]
): { userId: number; ref: React.Ref<HTMLVideoElement> }[] =>
  strArr.map((item) => ({
    userId: item.userId,
    ref: (node: HTMLVideoElement) => {
      // eslint-disable-next-line no-param-reassign
      if (node) node.srcObject = item.stream;
    },
  }));

export const getRoomLink = (roomId: number | null): string | null => {
  let res = null;
  if (typeof window !== 'undefined' && roomId) {
    res = window.location.href.replace(/\?.*/, '');
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
