/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: declarations.d.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/

declare module 'self-cert' {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  export default (props: {
    attrs: {
      commonName: string;
      countryName: string;
      stateName: string;
      locality: string;
      orgName: string;
      shortName: string;
    };
    bits: number;
    expires: Date;
  }): { privateKey: string; certificate: string; publicKey: string } => {
    /** */
  };
}
