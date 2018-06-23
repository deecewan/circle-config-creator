/* @flow */

import type { Executor, Version } from './types';

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
