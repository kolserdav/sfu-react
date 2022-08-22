import React, { useContext, useState } from 'react';
import ThemeContext from '../Theme.context';
import s from './Chat.module.scss';
import SendIcon from '../Icons/Send';
import IconButton from './ui/IconButton';

function Chat() {
  const theme = useContext(ThemeContext);
  const [message, setMessage] = useState<string>('');

  const changeText = (e: React.FormEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { target }: any = e;
    setMessage(target.value);
  };

  const sendMessage = () => {
    console.log(message);
  };

  return (
    <div className={s.wrapper} style={{ background: theme.colors.paper }}>
      <div className={s.container}>Chat</div>
      <div className={s.input}>
        <input onInput={changeText} value={message} />
        <IconButton onClick={sendMessage}>
          <SendIcon color={theme.colors.text} />
        </IconButton>
      </div>
    </div>
  );
}
export default Chat;
