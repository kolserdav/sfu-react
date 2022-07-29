/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: declarations.d.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Jul 29 2022 21:35:51 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
declare module 'wrtc' {
  export {
    MediaStream,
    MediaStreamTrack,
    RTCDataChannel,
    RTCDataChannelEvent,
    RTCDtlsTransport,
    RTCIceCandidate,
    RTCIceTransport,
    RTCPeerConnection,
    RTCPeerConnectionIceEvent,
    RTCRtpReceiver,
    RTCRtpSender,
    RTCRtpTransceiver,
    RTCSessionDescription,
    /**
     * @type {RTCSctpTransport}
     */
    RTCSctpTransport,
    /**
     * @type {typeof Navigator.getUserMedia}
     */
    getUserMedia,
    /**
     * @type {typeof Navigator.mediaDevices}
     */
    mediaDevices,
    /**
     * @type {Navigator.nonstandard}
     */
    nonstandard,
  };
}

declare module '../../node-webrtc/lib/index' {
  export {
    RTCPeerConnection,
    RTCSessionDescription,
    MediaStream,
    MediaStreamTrack,
    RTCIceCandidate,
  };
}
