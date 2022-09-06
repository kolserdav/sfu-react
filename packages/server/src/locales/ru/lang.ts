/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: lang.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import type { LocaleServer } from '../../types/interfaces';

const lang: LocaleServer = {
  server: {
    error: 'Ошибка сервера',
    roomInactive: 'Комната не активна',
    errorSendMessage: 'Ошибка отправки сообщения',
    youAreBanned: 'Вы забанены',
  },
  client: {
    shareScreen: 'Демонстрация экрана',
    changeTheme: 'Сменить тему',
    send: 'Отправить',
    quote: 'Цитата',
    edit: 'Редактировать',
    edited: 'измененно',
    delete: 'Удалить',
    erorGetSound: 'Демонстрация экрана без звука',
    errorGetCamera: 'Ошибка получения доступа к камере',
    errorGetDisplay: 'Ошибка при попытке демонстрации экрана',
    noMessages: 'В настоящее время сообщения отсутствуют',
    loading: 'Загружается ...',
    getDisplayCancelled: 'Демонстрация экрана отменена',
    mute: 'Откл. звук',
    unmute: 'Вкл. звук',
    ban: 'Забанить',
    unban: 'Разбанить',
    isAdminOfRoom: 'Админимтратор комнаты',
    youAreAdminOfRoom: 'Вы администратор комнаты',
    banneds: 'Забаненые гости',
    recordVideo: 'Запись видео',
    recordVideoStop: 'Остановить запись видео',
    videoRecording: 'Видео записывается',
    linkCopied: 'Адрес комнаты скопирован',
    generalSettings: 'Основные настройки',
    recordActions: 'Видеозапись',
  },
};

export default lang;
