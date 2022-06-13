import fs from 'fs';
import path from 'path';
import { htmlToText } from 'html-to-text';
import nodemailer from 'nodemailer';
import { SMTP_PORT, SMTP_EMAIL, SMTP_HOST, SMTP_PASS } from './constants';
import { log } from './lib';

export function checkEmail(email: string): boolean {
  return /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i.test(
    email
  );
}

function getTextOfEmail(html: string): string {
  return htmlToText(html, {
    wordwrap: 130,
  });
}

function replaceVariables(text: string, params: NotificationParams): string {
  let html = text;
  const _params: Partial<NotificationParams> = { ...params };
  delete _params.type;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyKeys: any[] = Object.keys(_params);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const keys: any[] = anyKeys.filter((item) => item !== 'email');
  for (let i = 0; keys[i]; i++) {
    const key: keyof Partial<NotificationParams> = keys[i];
    html = html.replace(new RegExp(`{${key}}`), params[key] || 'undefined');
  }
  return html;
}

export async function sendEmail(params: NotificationParams): Promise<1 | 0> {
  const { email, lang, type } = params;
  // Отправщик почты
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: false,
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASS,
    },
  });
  let html = '';
  try {
    html = fs
      .readFileSync(path.resolve(__dirname, `../../../notifications/${lang}/${type}.html`))
      .toString();
  } catch (e) {
    // Если шаблон не найден, то получает тот который в localhost (по умолчанию)
    html = fs
      .readFileSync(path.resolve(__dirname, `../../../notifications/en/${type}.html`))
      .toString();
  }
  if (html === '') {
    return 1;
  }
  html = replaceVariables(html, params);
  const text = getTextOfEmail(html);
  return await new Promise((resolve) => {
    const options = {
      from: SMTP_EMAIL,
      to: email,
      subject: SMTP_EMAIL,
      text,
      html,
    };
    const info = transporter.sendMail(options);
    info
      .then(() => {
        resolve(0);
      })
      .catch((err: Error) => {
        log('error', 'sendEmail', err);
        resolve(1);
      });
  });
}
