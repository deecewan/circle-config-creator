/* @flow */
/* eslint no-console: 0 */

export default class Filter {
  hasOnly: boolean = false;
  hasIgnore: boolean = false;
  hasWarned: boolean = false;
  onlyBranches: Array<string> = [];
  ignoreBranches: Array<string> = [];
  onlyTags: Array<string> = [];
  ignoreTags: Array<string> = [];

  clone() {
    const item = new this.constructor();
    item.hasOnly = this.hasOnly;
    item.hasIgnore = this.hasIgnore;
    item.onlyBranches = [...this.onlyBranches];
    item.ignoreBranches = [...this.ignoreBranches];
    item.onlyTags = [...this.onlyTags];
    item.ignoreTags = [...this.ignoreTags];

    return item;
  }

  ignore(...branch: Array<string>) {
    console.log(
      '[Deprecated] You should update to using `Filter` over `Branches`.',
    );
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
    console.log(
      '[Deprecated] You should update to using `Filter` over `Branches`.',
    );
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

  branches({ ignore, only }: { ignore?: Array<string>, only?: Array<string> }) {
    const item = this.clone();
    if (ignore) {
      item.ignoreBranches = ignore;
    }

    if (only) {
      item.onlyBranches = only;
    }

    return item;
  }

  tags({ ignore, only }: { ignore?: Array<string>, only?: Array<string> }) {
    const item = this.clone();
    if (ignore) {
      item.ignoreTags = ignore;
    }

    if (only) {
      item.onlyTags = only;
    }

    return item;
  }

  compose() {
    const onlyBranches =
      this.onlyBranches.length > 0 ? { only: this.onlyBranches } : {};
    const ignoreBranches =
      this.ignoreBranches.length > 0 ? { ignore: this.ignoreBranches } : {};

    const branches = {};
    if (onlyBranches.only || ignoreBranches.ignore) {
      branches.branches = {
        ...onlyBranches,
        ...ignoreBranches,
      };
    }
    const onlyTags = this.onlyTags.length > 0 ? { only: this.onlyTags } : {};
    const ignoreTags =
      this.ignoreTags.length > 0 ? { ignore: this.ignoreTags } : {};
    const tags = {};
    if (onlyTags.only || ignoreTags.ignore) {
      tags.tags = {
        ...onlyTags,
        ...ignoreTags,
      };
    }

    return {
      ...branches,
      ...tags,
    };
  }
}
