# circle-config-creator

> A simple helper to create CircleCI configs

<p align="center">
  <a href="https://yarnpkg.com/en/package/circle-config-creator">
    <img
      alt="NPM Version"
      src="https://img.shields.io/npm/v/circle-config-creator.svg"
    >
  </a>
  <a href="https://circleci.com/gh/deecewan/workflows/circle-config-creator">
    <img
      alt="CircleCI Build Status"
      src="https://img.shields.io/circleci/project/github/deecewan/circle-config-creator.svg"
    >
  </a>
  <a href="https://github.com/prettier/prettier">
    <img
      alt="code style: prettier"
      src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg"
    >
  </a>
  <a href="https://twitter.com/acdlite/status/974390255393505280">
    <img
      alt="Blazing Fast"
      src="https://img.shields.io/badge/speed-blazing%20%F0%9F%94%A5-brightgreen.svg"
    >
  </a>
</p>

## Overview

I noticed that a lot of my CircleCI config was repetitive. I had written a small
lib to help generate the config, but it got messy quickly. So I thought it
through a little more and wrote a decent config generation tool. This is the
result of that.

It allows the generation of workflows and jobs for CircleCI 2.0, and the sharing
of parts of config.

## Installation

This lib is written in JS. I'd recommend adding it to your `devDependencies` so
that everyone on your team can use it.

```
yarn add -D circle-config-creator
```

## Usage

- create a file to generate your config. I use `.circleci/config.js`.
- create a `Config`, `Workflow` and `Job` to get started
  - see [API](#api) for details

```js
import Config, { Workflow, Job, executors } from 'circle-config-creator';

const buildContainer = new executors.Docker('circleci/node:latest');
const config = new Config();

const build = new Job('build')
  .executor(buildContainer)
  .checkout()
  .run('./my-build-script.sh')
  .saveCache('v1-repo-{{ .Revision }}', '~/project');

const test = new Job('test')
  .executor(buildContainer)
  .restoreCache('v1-repo-{{ .Revision }}')
  .run({ command: './tests.sh', workingDirectory: '~/project/test' });

const workflow = new Workflow('build-and-test')
  .job(build)
  .job(test, [build]);

config
  .workflow(workflow)
  .writeSync();

```

- Ensure you add `Config#write` or `Config#writeSync` to put your config into
  `.circleci/config.yml`

## API

All methods are chainable (unless otherwise stated), but not immutable. They
work on a single instance. This is subject to change, so I wouldn't rely on it
too much.

### Config

`constructor() => Config`;

<hr />

```
workflow(workflow: Workflow) => Config
```

Add a workflow to the config

<hr />

```
location(directory: string) => Config
```

**Params**

| Name      | Type   | Default    | Description                                                                                  |
|-----------|--------|------------|----------------------------------------------------------------------------------------------|
| directory | string | (required) | The project directory this config is for. Saves to `.circleci/config.yml` of that directory. |

Change the location that the config will be saved to. This will *always* save to
the directory you pass in, in the `.circleci/config.yml` file.
Defaults to `__dirname` (the current directory)

<hr />

```
compose() => Object
```

Generate a JavaScript object based on the `Job`s and `Workflow`s added

<hr />

```
dump() => string
```

Generate `yaml` from the `Job`s and `Workflow`s added

<hr />

```
write(disclaimer: boolean, callback: ?((?ErrnoError) => mixed)) => Promise<void>
```

Write the config to `.circleci/config.yml`

**Params**

| Name       | Type                            | Default   | Description                                                                                  |
|------------|---------------------------------|-----------|----------------------------------------------------------------------------------------------|
| disclaimer | boolean                         | true      | Add a disclaimer to the top of the generated file, warning that changes will be overwritten. |
| callback   | (optional) (?ErrnoError) => any | undefined | Node-style callback for write completion                                                     |

<hr />

```
writeSync(disclaimer: boolean) => void
```

Write the config synchronously to `.circleci/config.yml`

**Params**

| Name       | Type                            | Default   | Description                                                                                  |
|------------|---------------------------------|-----------|----------------------------------------------------------------------------------------------|
| disclaimer | boolean                         | true      | Add a disclaimer to the top of the generated file, warning that changes will be overwritten. |

### Workflow

`constructor(name: string) => Workflow`

<hr />

```
job(
  job: Job,
  requires: ?Array<Job>,
  filter: ?Branches,
  type: ?'approval',
  context: ?string,
) => Workflow
```

Add a job to this workflow

**Params**

| Name     | Type                             | Default    | Description                                               |
|----------|----------------------------------|------------|-----------------------------------------------------------|
| job      | [Job](#job)                      | (required) | The job to add to the workflow                            |
| requires | (optional) Array<[Job](#job)>    | []         | Any jobs that this job requires                           |
| filter   | (optional) [Branches](#branches) | undefined  | Filter the branches that this job runs for                |
| type     | (optional) oneOf('approval')     | undefined  | The job type. See CircleCI config docs for more           |
| context  | (optional) string                | undefined  | The context of the job. See CircleCI config docs for more |

<hr />

```
schedule(cron: string, filter: Branches) => Workflow
```

Add a schedule to run this job against (see triggers on CircleCI docs)

**Params**

| Name   | Type                  | Default    | Description                               |
|--------|-----------------------|------------|-------------------------------------------|
| cron   | string                | (required) | The cron string to run this job on        |
| filter | [Branches](#branches) | (required) | The branches to run this schedule against |

### Job

`constructor(name: string) => Job`

<hr />

```
shell(shell: string) => Job
```

[CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#jobs)

Change the shell this job runs with

**Params**

| Name  | Type   | Default    | Description                  |
|-------|--------|------------|------------------------------|
| shell | string | (required) | The shell to run this job in |

<hr />

```
workingDirectory(directory: string) => Job
```

[CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#jobs)

**Params**

| Name      | Type   | Default    | Description                    |
|-----------|--------|------------|--------------------------------|
| directory | string | (required) | The directory this job runs in |

<hr />

```
parallelism(p: number) => Job
```

[CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#parallelism)

**Params**

| Name | Type   | Default    | Description                   |
|------|--------|------------|-------------------------------|
| p    | number | (required) | The number to run in parallel |

<hr />

```
executor(executor: Executor) => Job
```

[CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#docker--machine--macosexecutor)

The executor to run the job in. This *must* be set.

**Params**

| Name     | Type                  | Default    | Description                     |
|----------|-----------------------|------------|---------------------------------|
| executor | [Executor](#executor) | (required) | The executor to run this job in |

<hr />

```
environment(environment: { [key: string]: string }) => Job
environment(key: string, value: string) => Job
```

[CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#environment)

This will *append* to any environment you've already added. Callable multiple times.

**Params**

| Name        | Type                 | Default    | Description                                           |
|-------------|----------------------|------------|-------------------------------------------------------|
| environment | { [string]: string } | (required) | A map of environment variables to inject into the job |
|             |                      |            |                                                       |
| key         | string               | (required) | The environment key                                   |
| value       | string               | (required) | The environment value                                 |

<hr />

```
branches(branches: Branches) => Job
```

[CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#branches)

The branch filter config to apply to this job. Note that this will apply at the
workflow level, not at the job level. [See CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#branches-1).
This is a big reason that immutability might be added (so branches can be set inside different workflows).

**Params**

| Name     | Type                  | Default    | Description                                     |
|----------|-----------------------|------------|-------------------------------------------------|
| branches | [Branches](#branches) | (required) | The branch config for this job to run inside of |

<hr />

```
resourceClass(resourceClass: 'small' | 'medium' | 'medium+' | 'large' | 'xlarge') => Job
```

[CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#resource_class)

**Params**

| Name          | Type   | Default    | Description                                 |
|---------------|--------|------------|---------------------------------------------|
| resourceClass | string | (required) | The resource class for this job's container |

<hr />

```
run(command: string) => Job
run(config: {
  background?: boolean,
  command: string,
  environment?: { [string]: string },
  name?: string,
  noOutputTimeout?: string,
  shell?: string,
  when?: 'always' | 'on_success' | 'on_fail',
  workingDirectory?: string,
}) => Job
```

[CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#run)

See [the docs](https://circleci.com/docs/2.0/configuration-reference/#run) for
the param meanings

<hr />

```
checkout(path: ?string) => Job
```

[CircleCi Docs](https://circleci.com/docs/2.0/configuration-reference/#checkout)

**Params**

| Name | Type              | Default   | Description                      |
|------|-------------------|-----------|----------------------------------|
| path | (optional) string | ~/project | The path to checkout the code to |

<hr />

```
setupRemoteDocker(dockerLayerCaching: boolean = false) => Job
```

[CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#setup_remote_docker)

**Params**

| Name               | Type               | Default | Description                 |
|--------------------|--------------------|---------|-----------------------------|
| dockerLayerCaching | (optional) boolean | false   | Enable docker layer caching |

<hr />

```
saveCache(
  key: string,
  paths: string | Array<string>,
  name: string = 'Saving Cache',
  when: 'always' | 'on_success' | 'on_fail' = 'on_success',
) => Job
```

[CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#save_cache)

**Params**

| Name  | Type                                     | Default        | Description                                                            |
|-------|------------------------------------------|----------------|------------------------------------------------------------------------|
| key   | string                                   | (required)     | The key to save the cache to                                           |
| paths | string | Array<string>                   | (required)     | The path (or paths) to save to that cache key                          |
| name  | string                                   | 'Saving Cache' | The message to display when this step is running                       |
| when  | oneOf('always', 'on_success', 'on_fail') | 'on_success'   | When to save this cache. Defaults to saving when the job is successful |

<hr />

```
restoreCache(key: string | Array<string>, name: string = 'Restoring Cache') => Job
```

[CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#restore_cache)

**Params**

| Name | Type   | Default           | Description                                      |
|------|--------|-------------------|--------------------------------------------------|
| key  | string | (required)        | The keys to (attempt) to restore from            |
| name | string | 'Restoring Cache' | The message to display when this step is running |

<hr />

```
progressiveRestoreCache(key: string, base: ?string) => Job
```

*Experimental*: This will likely not work for everyone's existing config. It
works for most of my use-cases, and it's super handy.

It makes use the CircleCI ability to fallback on caches. It takes the key you
pass in, and sets the `restoreCache` job with each key, falling back to `base` (
which defaults to two chunks). It *only* splits on `-`s.

Example: with a key of `v1-dependencies-{{ checksum "yarn.lock" }}`, this will
result in attempting to restore the cache in the following order:

- `v1-dependencies-{{ checksum "yarn.lock" }}`
- `v1-dependencies-`

If you have a different base, you can specify it. For example, calling

```
job.progressiveRestoreCache(
  'v1-yarn-deps-{{ checksum "yarn.lock" }}-{{ .Revision }}',
  'v1-yarn-deps'
)
```

Will result in trying to restore the following

- `v1-yarn-deps-{{ checksum "yarn.lock" }}-{{ .Revision }}`
- `v1-yarn-deps-{{ checksum "yarn.lock" }}-`
- `v1-yarn-deps-`

**Params**

| Name | Type              | Default        | Description                        |
|------|-------------------|----------------|------------------------------------|
| key  | string            | (required)     | The full key to try restoring from |
| base | (optional) string | (see examples) | The base key of the cache          |

<hr />

```
deploy(command: string) => Job
deploy(config: {
  background?: boolean,
  command: string,
  environment?: { [string]: string },
  name?: string,
  noOutputTimeout?: string,
  shell?: string,
  when?: 'always' | 'on_success' | 'on_fail',
  workingDirectory?: string,
}) => Job
```

[CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#deploy)

[See Job#run](#run) and [the related CircleCI docs](https://circleci.com/docs/2.0/configuration-reference/#run)
for param information.

<hr />

```
storeArtifacts(path: string, destination: ?string) => Job
```

[CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#store_artifacts)

**Params**

| Name        | Type              | Default    | Description                                             |
|-------------|-------------------|------------|---------------------------------------------------------|
| path        | string            | (required) | The directory to save as build artifacts                |
| destination | (optional) string | undefined  | Prefix added to the artifact paths in the artifacts API |

<hr />

```
storeTestResults(path: string) => Job
```

[CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#store_test_results)

**Params**

| Name | Type   | Default    | Description                  |
|------|--------|------------|------------------------------|
| path | string | (required) | The path to the test results |

<hr />

```
persistToWorkspace(root: string, paths: string | Array<string>) => Job
```

[CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#persist_to_workspace)

**Params**

| Name  | Type                   | Default    | Description                                                 |
|-------|------------------------|------------|-------------------------------------------------------------|
| root  | string                 | (required) | An absolute path or one relative to the `working_directory` |
| paths | string | Array<string> | (required) | Paths to add to the shared workspace                        |

<hr />

```
attachWorkspace(at: string) => Job
```

[CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#attach_workspace)

**Params**

| Name | Type   | Default    | Description                              |
|------|--------|------------|------------------------------------------|
| at   | string | (required) | The directory to attach the workspace at |

<hr />

```
addSSHKeys(fingerprints: ?(string | Array<string>)) => Job
```

[CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#add_ssh_keys)

**Params**

| Name         | Type                              | Default        | Description                                         |
|--------------|-----------------------------------|----------------|-----------------------------------------------------|
| fingerprints | (optional) string | Array<string> | (all SSH keys) | the fingerprint (or fingerprints) to add to the job |

### Executors

Executors are the environment in which your job will run. Every job must be
assigned *exactly* one environment. The generator will throw an error if none
are specified. If you try and set more than one, the second will overwrite the
first.

It is likely a good idea to create your standard executor as a variable, and
pass the same one into all the jobs that need it.

You can access the executors in the following way:

`import { executors } from 'circle-config-generator';`

#### Docker

[CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#docker)

`constructor(): Docker`

There is an alternative constructor, which is likely the one you'll use. It
accepts an image string which is a convenient way to instantiate the executor if
you don't need multiple images to run together.

`constructor(image: string) => Docker`

<hr />

The remainder of the `Docker` API is adding an image, configuring that image,
and finally calling `.done()` on the image to close it and add it to the Docker
executor. You can add as many images as you like to the `Docker` container.

To add an image,

```
image(image: string) => Image
```

**Params**

| Name  | Type   | Default    | Description                             |
|-------|--------|------------|-----------------------------------------|
| image | string | (required) | The name of the docker image to be used |

<hr />

##### Image

See the non-required fields of the [CircleCI Docker
Docs](https://circleci.com/docs/2.0/configuration-reference/#docker) for the
meanings of the fields

```
auth(auth: { username: string, password: string }) => Image
```

<hr />

```
awsAuth(auth: {
  aws_access_key_id: string,
  aws_secret_access_key: string,
}) => Image
```

<hr />

```
command(...command: Array<string>) => Image
```

<hr />

```
entrypoint(...entrypoint: Array<string>) => Image
```

<hr />

```
environment(env: { [key: string]: string }) => Image
```

<hr />

```
name(name: string) => Image
```

<hr />

```
user(user: string) => Image
```

<hr />

```
done() => Docker
```

This closes up the image and returns back the parent `Docker` container.

#### Machine

Creates the machine executor.

[CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#machine)

`constructor(enabled: ?boolean) => Machine`

**Params**

| Name    | Type    | Default | Description             |
|---------|---------|---------|-------------------------|
| enabled | boolean | true    | Is the machine enabled? |

<hr />

```
enabled(enabled: boolean) => Machine
```

**Params**

| Name    | Type    | Default    | Description             |
|---------|---------|------------|-------------------------|
| enabled | boolean | (required) | Is the machine enabled? |

<hr />

```
image(image: string) => Machine
```

**Params**

| Name  | Type   | Default    | Description                      |
|-------|--------|------------|----------------------------------|
| image | string | (required) | The image to use for the machine |

<hr />

```
dockerLayerCaching(enabled: boolean) => Machine
```

**Params**

| Name    | Type    | Default    | Description                                     |
|---------|---------|------------|-------------------------------------------------|
| enabled | boolean | (required) | Should this machine enable Docker layer caching |

#### MacOS

Creates a macOS executor.

[CircleCI Docs](https://circleci.com/docs/2.0/configuration-reference/#macos)

`constructor(version: string) => MacOS`

**Params**

| Name    | Type   | Default    | Description                                                                                                               |
|---------|--------|------------|---------------------------------------------------------------------------------------------------------------------------|
| version | string | (required) | Version of macOS to run - check [here](https://circleci.com/docs/2.0/testing-ios/#supported-xcode-versions) for full list |

### Branches

This is used to set which branches a particular `Job` or `Workflow` will run on.

`constructor() => Branches`

<hr />

```
ignore(...branches: Array<string>) => Branches
```

Sets branches that should be ignored by the Job or Trigger using this instance
*Note:* Setting this will override any `Branches#only` branches that have been
set.

<hr />

```
only(...branches: Array<string>) => Branches
```

Filter down to only run on the branches passed in.

