/* @flow */
/* eslint no-console: 0 */

import Branches from './branches';
import { type Executor } from './executors';

type When = 'always' | 'on_success' | 'on_fail';
type Environment = { [string]: string };
type ResourceClass =
  | 'small'
  | 'medium'
  | 'medium+'
  | 'large'
  | 'xlarge'
  ;

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
    no_output_timeout: noOutputTimeout,
    working_directory: workingDirectory,
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
  state: State;
  // eslint-disable-next-line flowtype/no-weak-types
  steps: Array<Object | string> = [];

  constructor(name: string) {
    checkName(name);
    this.name = name;
  }

  shell(sh: string) {
    this.state.shell = sh;

    return this;
  }

  workingDirectory(directory: string) {
    this.state.working_directory = directory;
    return this;
  }

  parallelism(p: number) {
    this.state.parallelism = p;
    return this;
  }

  exec: Executor;
  executor(executor: Executor) {
    this.exec = executor;
    return this;
  }

  environment(key: Environment | string, value: ?string) {
    let e: Environment;
    if (typeof key === 'string') {
      if (typeof value === 'string') {
        e = { [key]: value };
      } else {
        throw new Error('If you provide an environment key, you must provide a string value');
      }
    } else {
      e = key;
    }

    Object.assign(this.state.environment, e);

    return this;
  }

  branchConfig: Branches;
  branches(b: Branches) {
    this.branchConfig = b;
    return this;
  }

  resourceClass(resourceClass: ResourceClass) {
    this.state.resource_class = resourceClass;
    return this;
  }

  run(command: string | RunConfig) {
    this.steps.push({ run: normalizeRunConfig(command) });

    return this;
  }

  checkout(path: ?string = this.state.working_directory) {
    this.steps.push({
      checkout: {
        path,
      },
    });

    return this;
  }

  setupRemoteDocker(dockerLayerCaching: ?boolean = false) {
    this.steps.push({
      setup_remote_docker: {
        docker_layer_caching: dockerLayerCaching,
      },
    });

    return this;
  }

  saveCache(
    paths: string | Array<string>,
    key: string,
    name: ?string = 'Saving Cache',
    when: ?When = 'always',
  ) {
    this.steps.push({
      save_cache: {
        paths: [].concat(paths),
        key,
        name,
        when,
      },
    });

    return this;
  }

  restoreCache(
    keys: string | Array<string>,
    name: ?string = 'Restoring Cache',
  ) {
    const k = Array.isArray(keys) ? { keys } : { key: keys };
    this.steps.push({
      restore_cache: {
        ...k,
        name,
      },
    });

    return this;
  }

  deploy(command: string | RunConfig) {
    this.steps.push({
      deploy: normalizeRunConfig(command),
    });

    return this;
  }

  storeArtifacts(path: string, destination: ?string) {
    this.steps.push({
      store_artifacts: {
        path,
        destination,
      },
    });

    return this;
  }

  storeTestResults(path: string) {
    this.steps.push({
      store_test_results: {
        path,
      },
    });

    return this;
  }

  persistToWorkspace(root: string, paths: string | Array<string>) {
    this.steps.push({
      persist_to_workspace: {
        root,
        paths: [].concat(paths),
      },
    });

    return this;
  }

  attachWorkspace(at: string) {
    this.steps.push({
      attach_workspace: { at },
    });

    return this;
  }

  addSSHKeys(fingerprints: ?(string | Array<string>)) {
    if (fingerprints !== undefined) {
      this.steps.push('add_ssh_keys');
    } else {
      this.steps.push({
        add_ssh_keys: {
          fingerprints,
        },
      });
    }

    return this;
  }

  compose() {
    if (!this.exec) {
      throw new Error(`You must set an executor for \`${this.name}\``);
    }
    const branches = this.branchConfig
      ? this.branchConfig.compose()
      : {};
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
