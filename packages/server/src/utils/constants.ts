import dotenv from 'dotenv';

dotenv.config();

export const { SERVER_PORT: _SERVER_PORT } = process.env as {
  SERVER_PORT: string;
};

export const SERVER_PORT = parseInt(_SERVER_PORT, 10);
