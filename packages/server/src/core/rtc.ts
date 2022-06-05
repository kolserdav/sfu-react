import wrtc, { RTCPeerConnection } from 'wrtc';
import { RTCInterface } from '../types/interfaces';

class RTC implements RTCInterface {
  public roomId = '';

  public userId = 0;

  public rtc: RTCPeerConnection;

  constructor({ id }: { id: number }) {
    this.rtc = this.createRTC({ id });
  }

  public createRTC(args: { id: number }): RTCPeerConnection {
    this.rtc = new RTCPeerConnection();
    return this.rtc;
  }
}

export default RTC;
