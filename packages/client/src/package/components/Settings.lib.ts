// eslint-disable-next-line import/prefer-default-export
export const getVideoSrc = ({
  port,
  server,
  name,
  roomId,
}: {
  port: number;
  server: string;
  name: string;
  roomId: string | number;
}) => {
  let protocol = 'http:';
  if (typeof window !== 'undefined') {
    protocol = window.location.protocol;
  }
  return `${protocol}//${server}:${port}/${roomId}/${name}`;
};
