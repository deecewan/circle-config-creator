/* @flow */

import Job from './job';
import Filter from './filter';

type Schedule = {
  cron: string,
  filters: Object, // eslint-disable-line flowtype/no-weak-types
};

type JobConfig = {
  context?: string,
  filters?: Filter,
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

  clone() {
    const item = new this.constructor(this.name);
    item.name = this.name;
    item.jobs = [...this.jobs];
    item.schedules = [...this.schedules];

    return item;
  }

  job(
    job: Job,
    requires: ?Array<Job>,
    filter: ?Filter,
    type: ?'approval',
    context: ?string,
  ) {
    if (type != null) {
      // eslint-disable-next-line no-console
      console.warn(
        'Passing `type` to Workflow#job is deprecated. Use Job#type instead. This will be removed in the next major version',
      );
    }
    const config: JobConfig = { job };
    if (requires) {
      config.requires = requires;
    }
    const t = type || job.jobType;
    if (t) {
      config.type = t;
    }
    if (context) {
      config.context = context;
    }
    if (filter) {
      config.filters = filter;
    }
    const item = this.clone();
    item.jobs.push(config);

    return item;
  }

  schedule(cron: string, filter: Filter) {
    const item = this.clone();
    item.schedules.push({ cron, filters: filter.compose() });

    return item;
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
