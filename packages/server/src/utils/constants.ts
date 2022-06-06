export const {
  SERVER_PORT: _SERVER_PORT,
  WEBTOKEN_KEY,
  SMTP_EMAIL,
  SMTP_PORT,
  SMTP_HOST,
  SMTP_PASS,
  APP_URL,
} = process.env as {
  SERVER_PORT: string;
  WEBTOKEN_KEY: string;
  SMTP_EMAIL: string;
  SMTP_PASS: string;
  SMTP_PORT: string;
  SMTP_HOST: string;
  APP_URL: string;
};

export const SERVER_PORT = parseInt(_SERVER_PORT, 10);
