export const { SERVER_PORT } = process.env as {
  SERVER_PORT: string;
};

export const port = parseInt(SERVER_PORT, 10);
