/******************************************************************************************
 * Repository: https://github.com/kolserdav/julia-teams.git
 * File name: declarations.d.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include WebRTC and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Sun Jun 19 2022 00:09:49 GMT+0700 (Krasnoyarsk Standard Time)
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
