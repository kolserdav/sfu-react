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
    videoRecordStop: 'Видеозапись остановлена',
    forbidden: 'Запрещено',
    notAuthorised: 'Не авторизован',
    duplicateTab:
      'Попытка неподдерживаемого повторного подключения в новой вкладке. Одновременно к комнате можно подключиться только с одного места.',
    connected: 'Подключился',
    ownerCanNotBeDeleted: 'Создатель комнаты не может быть удален из адсминистраторов',
    ownerCanNotBeBanned: 'Нельзя забанить создателя комнаты',
  },
  client: {
    shareScreen: 'Демонстрация экрана',
    changeTheme: 'Сменить тему',
    send: 'Отправить',
    quote: 'Цитата',
    edit: 'Редактировать',
    edited: 'изменено',
    delete: 'Удалить',
    erorGetSound: 'Демонстрация экрана без звука',
    errorGetCamera: 'Ошибка получения доступа к камере',
    errorGetDisplay: 'Ошибка при попытке демонстрации экрана',
    noMessages: 'В настоящее время сообщения отсутствуют',
    loading: 'Загружается ...',
    getDisplayCancelled: 'Демонстрация экрана заблокирована',
    mute: 'Откл. звук',
    unmute: 'Вкл. звук',
    ban: 'Забанить',
    unban: 'Разбанить',
    isAdminOfRoom: 'Администратор комнаты',
    youAreAdminOfRoom: 'Вы администратор комнаты',
    banneds: 'Забаненые гости',
    recordVideo: 'Запись видео',
    recordVideoStop: 'Остановить запись видео',
    videoRecording: 'Видео записывается',
    linkCopied: 'Адрес комнаты скопирован',
    generalSettings: 'Основные настройки',
    recordActions: 'Видеозапись',
    changeLang: 'Сменить язык панели',
    darkTheme: 'Темная тема',
    startRecord: 'Старт записи',
    recording: 'Записывает ...',
    stopRecord: 'Остановить запись',
    willBeReconnect: 'Дублирующая вкладка будет перенаправлены на предыдущую сраницу',
    guests: 'Гости комнаты',
    micOff: 'Отключить микрофон',
    micOn: 'Включить микрофон',
    cameraOff: 'Отключить камеру',
    cameraOn: 'Включить камеру',
    copyRoomLink: 'Скопировать адрес комнаты',
    editMessage: 'Редактируется ссобщение',
    messageDeleted: 'Сообщение удалено',
    askForTheFloor: 'Попросить слово',
    requestedTheFloor: 'Запросил слово',
    shortAdmin: 'админ',
    muteAll: 'Откл. звук всем',
    muteForNew: 'Без звука для новых',
    blockChat: 'Заблокировать чат',
    unblockChat: 'Разболокировать чат',
    chatBlocked: 'Чат заблокирован администратором',
    numberOfGuests: 'Количество участников',
    noActiveVideoStreams: 'Активные видеопотки отсутствуют',
    videoDeviceRequired:
      'Устройство видеозахвата (вебкамера) обязательно для начала работы. При старте видеопоток отключен по умолчанию.',
    audioDeviceRequired:
      'Устройство аудиозахвата (микрофон) обязательно для начала работы. При старте аудиопоток отключен по умолчанию.',
    setAsAdmin: 'Сделать админом',
    deleteFromAdmins: 'Удалить из админов',
    inactivityDisconnect: 'Вы были отключены за отсутствие активности',
  },
};

export default lang;
