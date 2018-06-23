/* @flow */

import Job from './job';
import Branches from './branches';

type Schedule = {
  cron: string,
  filters: Object, // eslint-disable-line flowtype/no-weak-types
};

type JobConfig = {
  context?: string,
  filters?: Branches,
  job: Job,
  requires?: Array<Job>,
  type?: 'approval',
};

export default class Workflow {
  name: string;
  jobs: Array<JobConfig> = [];
  schedules: Array<Schedule> = [];

  constructor(name: string) {
    this.name = name;
  }

  job(
    job: Job,
    requires: ?Array<Job>,
    filter: ?Branches,
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
    if (filter) {
      config.filters = filter;
    }
    this.jobs.push(config);

    return this;
  }

  schedule(cron: string, filter: Branches) {
    this.schedules.push({ cron, filters: filter.compose() });
  }

  compose() {
    const triggers =
      this.schedules.length > 0
        ? {
            triggers: this.schedules.map(schedule => ({
              schedule,
            })),
          }
        : {};
    return {
      [this.name]: {
        ...triggers,
        jobs: this.jobs.map(({ job, ...rest }) => {
          if (Object.keys(rest).length === 0) {
            return job.name;
          }
          const requires = rest.requires
            ? { requires: rest.requires.map(j => j.name) }
            : {};
          const filters = rest.filters
            ? { filters: rest.filters.compose() }
            : {};
          return {
            [job.name]: {
              ...rest,
              ...requires,
              ...filters,
            },
          };
        }),
      },
    };
  }
}
