export interface RoomProps {
  id: number;
}

export interface Streams {
  targetId: number | string;
  stream: MediaStream;
  ref: React.Ref<HTMLVideoElement>;
}
