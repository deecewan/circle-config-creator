/* @flow */
/* eslint no-console: 0 */

export default class Branches {
  _hasOnly: boolean = false;
  _hasIgnore: boolean = false;
  _hasWarned: boolean = false;
  onlyBranches: Array<string> = [];
  ignoreBranches: Array<string> = [];

  ignore(...branch: Array<string>) {
    if (!this._hasWarned && this._hasOnly) {
      console.log(
        '[Warn] Adding `ignore` branches will result in `only` branches being ignored',
      );
      this._hasWarned = true;
    }

    this._hasIgnore = true;
    this.ignoreBranches.push(...branch);

    return this;
  }

  only(...branch: Array<string>) {
    if (!this._hasWarned && this._hasIgnore) {
      console.log(
        '[Warn] Adding `ignore` branches will result in `only` branches being ignored',
      );
      this._hasWarned = true;
    }

    this._hasOnly = true;
    this.onlyBranches.push(...branch);

    return this;
  }

  compose() {
    const only =
      this.onlyBranches.length > 0 ? { only: this.onlyBranches } : {};
    const ignore =
      this.ignoreBranches.length > 0 ? { ignore: this.ignoreBranches } : {};
    return {
      branches: {
        ...only,
        ...ignore,
      },
    };
  }
}
