/******************************************************************************************
 * Repository: https://github.com/kolserdav/webrtc-sfu-node-react.git
 * File name: declarations.d.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: Show LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 28 2022 22:09:23 GMT+0700 (Krasnoyarsk Standard Time)
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
