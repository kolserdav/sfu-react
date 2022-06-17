export interface RoomProps {
  id: number;
}

export interface Streams {
  userId: number;
  stream: MediaStream;
  ref: React.Ref<HTMLVideoElement>;
}
