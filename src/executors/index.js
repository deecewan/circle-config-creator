/* @flow */

export interface Executor {
  // eslint-disable-next-line flowtype/no-weak-types
  compose(): ({ ['macos' | 'machine' ]: Object }) | ({ ['docker']: Array<any> }),
}
