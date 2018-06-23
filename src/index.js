/* @flow */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import Workflow from './workflow';
import Job from './job';
import Branches from './branches';
import executors from './executors';

export { Workflow, Job, Branches, executors };

export default class Config {
  static CONFIG_LOCATION = '.circleci/config.yml';
  place: string = path.resolve(Config.CONFIG_LOCATION);
  workflows: Array<Workflow> = [];

  workflow(workflow: Workflow) {
    this.workflows.push(workflow);

    return this;
  }

  location(directory: string = __dirname) {
    this.place = path.resolve(directory, this.constructor.CONFIG_LOCATION);

    return this;
  }

  compose() {
    const workflows = this.workflows
      .map(w => w.compose())
      .reduce((acc, curr) => ({ ...acc, ...curr }), {});
    const jobs = this.workflows
      .map(w => w.jobs.map(j => j.job.compose()))
      .reduce((acc, curr) => acc.concat(curr), []);
    return {
      version: '2',
      workflows: {
        version: '2',
        ...workflows,
      },
      jobs,
    };
  }

  dump() {
    const config = this.compose();

    return yaml.safeDump(config);
  }

  write(cb: ?(?ErrnoError) => mixed) {
    const dump = this.dump();

    const p = path.resolve(this.place);
    return new Promise((resolve, reject) => {
      fs.writeFile(p, dump, (err) => {
        if (cb) {
          cb(err);
        }
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  writeSync() {
    const dump = this.dump();

    const p = path.resolve(this.place);
    fs.writeFileSync(p, dump);
  }
}
