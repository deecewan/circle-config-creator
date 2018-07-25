/* @flow */

import Filter from './filter';

export default class Branches extends Filter {
  constructor() {
    super();
    // eslint-disable-next-line no-console
    console.log('[Deprecated] You should use `Filter` instead of `Branches`');
  }
}
