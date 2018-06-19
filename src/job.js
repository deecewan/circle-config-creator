/* @flow */
/* eslint no-console: 0 */

import typeof Branches from './branches';
import { type Executor } from './executors';

type When = 'always' | 'on_success' | 'on_fail';
type Environment = { [string]: string };

// keep track of names to warn if we have a duplicate
const globalNameList = [];

export default class Job {
  name: string;
  // eslint-disable-next-line flowtype/no-weak-types
  steps: Array<Object | string>;

  constructor(name: string) {
    if (globalNameList.includes(name)) {
      console.log(`[Warn] Duplicate job name: \`${name}\``);
    }
    globalNameList.push(name);
    this.name = name;
  }

  _shell: string;
  shell(sh: string) {
    this._shell = sh;

    return this;
  }

  _workingDirectory: string = '~/project';
  workingDirectory(directory: string) {
    this._workingDirectory = directory;
    return this;
  }

  _parallelism: number = 1;
  parallelism(p: number) {
    this._parallelism = p;
    return this;
  }

  _executor: Executor;
  executor(executor: Executor) {
    this._executor = executor;
    return this;
  }

  env: Environment;
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

    Object.assign(this.env, e);

    return this;
  }

  branchConfig: Branches;
  branches(b: Branches) {
    this.branchConfig = b;
  }

  checkout(path: ?string = this._workingDirectory) {
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

  deploy(command: string | Array<string>) {
    this.steps.push({
      deploy: {
        command: [].concat(command).join('\n'),
      },
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
}
