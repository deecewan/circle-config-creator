/* @flow */
/* eslint no-console: 0 */

export default class Branches {
  hasOnly: boolean = false;
  hasIgnore: boolean = false;
  hasWarned: boolean = false;
  onlyBranches: Array<string> = [];
  ignoreBranches: Array<string> = [];

  clone() {
    const item = new this.constructor();
    item.hasOnly = this.hasOnly;
    item.hasIgnore = this.hasIgnore;
    item.onlyBranches = this.onlyBranches;
    item.ignoreBranches = this.ignoreBranches;

    return item;
  }

  ignore(...branch: Array<string>) {
    const item = this.clone();
    if (!item.hasWarned && item.hasOnly) {
      console.log(
        '[Warn] Adding `ignore` branches will result in `only` branches being ignored',
      );
      item.hasWarned = true;
    }

    item.hasIgnore = true;
    item.ignoreBranches.push(...branch);

    return item;
  }

  only(...branch: Array<string>) {
    const item = this.clone();
    if (!item.hasWarned && item.hasIgnore) {
      console.log(
        '[Warn] Adding `ignore` branches will result in `only` branches being ignored',
      );
      item.hasWarned = true;
    }

    item.hasOnly = true;
    item.onlyBranches.push(...branch);

    return item;
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
