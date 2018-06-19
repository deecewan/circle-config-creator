/* @flow */
/* eslint no-console: 0 */

export default class Branches {
  _hasOnly: boolean = false;
  _hasIgnore: boolean = false;
  _hasWarned: boolean = false;
  branches: { ignore: Array<string>, only: Array<string> } = {
    only: [],
    ignore: [],
  };

  ignore(...branch: Array<string>) {
    if (!this._hasWarned && this._hasOnly) {
      console.log('[Warn] Adding `ignore` branches will result in `only` branches being ignored');
      this._hasWarned = true;
    }

    this._hasIgnore = true;
    this.branches.ignore.push(...branch);

    return this;
  }

  only(...branch: Array<string>) {
    if (!this._hasWarned && this._hasIgnore) {
      console.log('[Warn] Adding `ignore` branches will result in `only` branches being ignored');
      this._hasWarned = true;
    }

    this._hasOnly = true;
    this.branches.only.push(...branch);

    return this;
  }

  compose() {
    return {
      branches: this.branches,
    };
  }
}
