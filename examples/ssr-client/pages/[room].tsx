
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import document from 'next/document';

const Uyem = dynamic(() => import('uyem'));


const Room = () => {
  const router = useRouter();
  return (
    <Uyem
      room={{
        server: 'localhost',
        port: 3001,
        iceServers: [
          {
            urls: ['stun:127.0.0.1:3478'],
          },
          {
            urls: ['turn:127.0.0.2:3478'],
            username: 'username',
            credential: 'password',
          },
        ],
        userId: router.asPath.replace(/.+\?uid=/, '') || '0',
      }}
    />
  )
}

export default Room;