/* @flow */

import type { Executor } from './';

type Version =
  | '9.4.0'
  | '9.3.1'
  | '9.3.0'
  | '9.2.0'
  | '9.1.0'
  | '9.0.1'
  | '8.3.3';

export default class MacOS implements Executor {
  version: Version;

  constructor(version: Version) {
    this.version = version;
  }

  compose() {
    return {
      macos: {
        xcode: this.version,
      },
    };
  }
}
