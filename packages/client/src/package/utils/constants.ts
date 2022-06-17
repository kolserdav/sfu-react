export const MEDIA_CONSTRAINTS = {
  audio: true,
  video: true,
};

export const WS_TTL = 1;
export const LOG_LEVEL = process.env.NODE_ENV === 'production' ? 3 : 0;
export const START_TIMEOUT = 999;
