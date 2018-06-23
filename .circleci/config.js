/* @flow */

import Config, { Job, Workflow, executors } from '../src';

const config = new Config();

const YARN_CACHE = 'v1-deps-{{ checksum "yarn.lock" }}';
const REPO_CACHE = 'v1-repo-{{ .Revision }}';
const exec = new executors.Docker('circleci/node:latest');

const build = new Job('build')
  .executor(exec)
  .checkout()
  .progressiveRestoreCache(YARN_CACHE)
  .run('yarn install --frozen-lockfile')
  .saveCache(REPO_CACHE, '~/project')
  .saveCache(YARN_CACHE, '~/project/node_modules');

const test = new Job('test')
  .executor(exec)
  .restoreCache(REPO_CACHE)
  .run('yarn jest');

const lint = new Job('lint')
  .executor(exec)
  .restoreCache(REPO_CACHE)
  .run('yarn lint');

const workflow = new Workflow('build-and-test')
  .job(build)
  .job(test, [build])
  .job(lint, [build]);

config.workflow(workflow).writeSync();
