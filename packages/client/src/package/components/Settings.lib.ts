// eslint-disable-next-line import/prefer-default-export
export const getVideoSrc = ({
  port,
  server,
  name,
}: {
  port: number;
  server: string;
  name: string;
}) => {
  let protocol = 'http:';
  if (typeof window !== 'undefined') {
    protocol = window.location.protocol;
  }
  return `${protocol}//${server}:${port}/${name}`;
};
