/* @flow */
/* eslint no-console: 0 */

import Branches from './branches';
import { type Executor } from './executors/types';

type When = 'always' | 'on_success' | 'on_fail';
type Environment = { [string]: string };
type ResourceClass = 'small' | 'medium' | 'medium+' | 'large' | 'xlarge';

type RunConfig = {
  background?: boolean,
  command: string,
  environment?: Environment,
  name?: string,
  noOutputTimeout?: string,
  shell?: string,
  when?: When,
  workingDirectory?: string,
};

type State = {
  environment?: Environment,
  parallelism?: number,
  resource_class?: string,
  shell?: string,
  working_directory?: string,
};

function normalizeRunConfig(runConfig: string | RunConfig) {
  if (typeof runConfig === 'string') {
    return runConfig;
  }

  const { noOutputTimeout, workingDirectory, ...rest } = runConfig;

  return {
    ...rest,
    ...(noOutputTimeout ? { no_output_timeout: noOutputTimeout } : {}),
    ...(workingDirectory ? { working_directory: workingDirectory } : {}),
  };
}

// keep track of names to warn if we have a duplicate
const globalNameList = [];

function checkName(name) {
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  if (globalNameList.includes(name)) {
    console.log(`[Warn] Duplicate job name: \`${name}\``);
  }
  globalNameList.push(name);
}

export default class Job {
  name: string;
  state: State = {};
  // eslint-disable-next-line flowtype/no-weak-types
  steps: Array<Object | string> = [];
  exec: Executor;
  branchConfig: Branches;

  constructor(name: string) {
    checkName(name);
    this.name = name;
  }

  clone() {
    const clone = new this.constructor(this.name);
    clone.name = this.name;
    clone.state = { ...this.state };
    clone.steps = [...this.steps];
    clone.exec = this.exec;
    clone.branchConfig = this.branchConfig;
    return clone;
  }

  shell(sh: string) {
    const clone = this.clone();
    clone.state.shell = sh;

    return clone;
  }

  workingDirectory(directory: string) {
    const clone = this.clone();
    clone.state.working_directory = directory;
    return clone;
  }

  parallelism(p: number) {
    const clone = this.clone();
    clone.state.parallelism = p;
    return clone;
  }

  executor(executor: Executor) {
    const clone = this.clone();
    clone.exec = executor;
    return clone;
  }

  environment(key: Environment | string, value: ?string) {
    let e: Environment;
    if (typeof key === 'string') {
      if (typeof value === 'string') {
        e = { [key]: value };
      } else {
        throw new Error(
          'If you provide an environment key, you must provide a string value',
        );
      }
    } else {
      e = key;
    }

    const clone = this.clone();
    clone.state.environment = clone.state.environment || {};

    Object.assign(clone.state.environment, e);

    return clone;
  }

  branches(b: Branches) {
    const clone = this.clone();
    clone.branchConfig = b;
    return clone;
  }

  resourceClass(resourceClass: ResourceClass) {
    const clone = this.clone();
    clone.state.resource_class = resourceClass;
    return clone;
  }

  run(command: string | RunConfig) {
    const clone = this.clone();
    clone.steps.push({ run: normalizeRunConfig(command) });

    return clone;
  }

  checkout(path: ?string) {
    const clone = this.clone();
    const c = path ? { checkout: { path } } : 'checkout';
    clone.steps.push(c);

    return clone;
  }

  setupRemoteDocker(dockerLayerCaching: ?boolean = false) {
    const clone = this.clone();
    clone.steps.push({
      setup_remote_docker: {
        docker_layer_caching: dockerLayerCaching,
      },
    });

    return clone;
  }

  saveCache(
    key: string,
    paths: string | Array<string>,
    name: ?string = 'Saving Cache',
    when: ?When = 'on_success',
  ) {
    const clone = this.clone();
    clone.steps.push({
      save_cache: {
        paths: [].concat(paths),
        key,
        name,
        when,
      },
    });

    return clone;
  }

  restoreCache(
    keys: string | Array<string>,
    name: ?string = 'Restoring Cache',
  ) {
    const clone = this.clone();
    const k = Array.isArray(keys) ? { keys } : { key: keys };
    clone.steps.push({
      restore_cache: {
        ...k,
        name,
      },
    });

    return clone;
  }

  progressiveRestoreCache(key: string, base: ?string) {
    const clone = this.clone();
    const b = base == null ? '' : base;
    console.log(
      '[Warn] Progressive cache restore is very experimental and may not work with every configuration style',
    );
    if (key.indexOf(b) !== 0) {
      throw new Error('`key` must start with `base`.');
    }
    const keys = [key];
    const split = key.replace(b, '').split('-');
    for (let i = split.length - 1; i > (base == null ? 1 : 0); i -= 1) {
      keys.push(`${b}${split.slice(0, i).join('-')}-`);
    }

    return clone.restoreCache(keys);
  }

  deploy(command: string | RunConfig) {
    const clone = this.clone();
    clone.steps.push({
      deploy: normalizeRunConfig(command),
    });

    return clone;
  }

  storeArtifacts(path: string, destination: ?string) {
    const clone = this.clone();
    clone.steps.push({
      store_artifacts: {
        path,
        destination,
      },
    });

    return clone;
  }

  storeTestResults(path: string) {
    const clone = this.clone();
    clone.steps.push({
      store_test_results: {
        path,
      },
    });

    return clone;
  }

  persistToWorkspace(root: string, paths: string | Array<string>) {
    const clone = this.clone();
    clone.steps.push({
      persist_to_workspace: {
        root,
        paths: [].concat(paths),
      },
    });

    return clone;
  }

  attachWorkspace(at: string) {
    const clone = this.clone();
    clone.steps.push({
      attach_workspace: { at },
    });

    return clone;
  }

  addSSHKeys(fingerprints: ?(string | Array<string>)) {
    const clone = this.clone();
    if (fingerprints === undefined) {
      clone.steps.push('add_ssh_keys');
    } else {
      clone.steps.push({
        add_ssh_keys: {
          fingerprints: [].concat(fingerprints),
        },
      });
    }

    return clone;
  }

  compose() {
    if (!this.exec) {
      throw new Error(`You must set an executor for \`${this.name}\``);
    }
    const branches = this.branchConfig ? this.branchConfig.compose() : {};
    return {
      [this.name]: {
        ...this.state,
        ...this.exec.compose(),
        ...branches,
        steps: this.steps,
      },
    };
  }
}
