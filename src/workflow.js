/* @flow */

import Job from './job';
import Branches from './branches';

type Schedule = {
  cron: string,
  filters: Object, // eslint-disable-line flowtype/no-weak-types
};

type JobConfig = {
  context?: string,
  job: Job,
  requires?: Array<Job>,
  type?: 'approval',
};

export default class Workflow {
  name: string;
  jobs: Array<JobConfig> = [];
  schedule: Array<Schedule> = [];

  constructor(name: string) {
    this.name = name;
  }

  job(
    job: Job,
    requires: ?Array<Job>,
    type: ?'approval',
    context: ?string,
  ) {
    const config: JobConfig = { job };
    if (requires) {
      config.requires = requires;
    }
    if (type) {
      config.type = type;
    }
    if (context) {
      config.context = context;
    }
    this.jobs.push(config);

    return this;
  }

  schedule(cron: string, filter: Branches) {
    this.schedule.push({ cron, filters: filter.compose() });
  }

  compose() {
    return {
      [this.name]: {
        triggers: this.schedule.map(schedule => ({
          schedule,
        })),
        jobs: this.jobs.map(({ job, ...rest }) => ({
          [job.name]: rest,
        })),
      },
    };
  }
}
