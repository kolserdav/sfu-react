// @ts-check
const puppeteer = require('puppeteer');
const { openRoom, startServer } = require('./lib');
const { log } = require('../packages/server/dist/utils/lib');

const user1 = 2;
const user2 = 3;
const address = 'http://localhost:3000';
const roomId = '2';
const headless = true;
const openChatId = '#open-chat';
const textArea = 'textarea';
const testMessage = 'test';
const sendButton = 'div[id="send-message"]';
const messages = '#messages';

/**
 *
 * @param {puppeteer.Page} page
 * @param {string} selector
 */
const clickByButton = (page, selector) => {
  page.evaluate((btnSelector) => {
    /**
     * @type {any}
     */
    const btn = document.querySelector(btnSelector);
    btn.click();
  }, selector);
};

(async () => {
  await startServer();
  const page1 = await openRoom(address, roomId, user1, headless);
  const page2 = await openRoom(address, roomId, user2, headless);

  await page1.waitForSelector(openChatId);
  const button1 = await page1.$(openChatId);
  await button1?.click();
  await page2.waitForSelector(openChatId);
  const button2 = await page2.$(openChatId);
  await button2?.click();

  await page1.waitForSelector(textArea);
  const textArea1 = await page1.$(textArea);
  await textArea1?.focus();
  await textArea1?.type(testMessage);
  clickByButton(page1, sendButton);

  await page2.waitForTimeout(3000);
  const checkMess = await page2.evaluate(async (messContSelector) => {
    const messCont = document.querySelector(messContSelector);
    const firstMess = messCont?.firstElementChild;
    const textEll =
      firstMess?.firstElementChild?.nextElementSibling?.firstElementChild?.nextElementSibling;
    return textEll?.innerHTML;
  }, messages);
  if (checkMess !== testMessage) {
    process.exit(1);
  }
  log('info', 'Sucess test messages', {}, true);
  process.exit(0);
})();
