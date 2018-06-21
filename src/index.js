/* @flow */

import Job from './job';
import Workflow from './workflow';

export default class Config {
  workflows: Array<Workflow> = [];

  workflow(workflow: Workflow) {
    this.workflows.push(workflow);

    return this;
  }

  compose() {
    const workflows = this.workflows
      .map(w => w.compose())
      .reduce((acc, curr) => ({ ...acc, ...curr }), {});
    const jobs = this.workflow
      .map(w => w.jobs.map(j => j.job))
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
}
