export interface RoomProps {
  id: number | string;
}

export interface Streams {
  targetId: number | string;
  stream: MediaStream;
  ref: React.Ref<HTMLVideoElement>;
}
