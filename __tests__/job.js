/* @flow */

import Job from '../src/job';
import Docker from '../src/executors/docker';

const docker = new Docker('test-image:latest');

describe('Job', () => {
  it('can create a simple job', () => {
    const job = new Job('test_job').executor(docker);
    expect(job.compose()).toMatchSnapshot();
  });

  it('complains if no executor', () => {
    const job = new Job('test_job');
    expect(() => job.compose()).toThrowErrorMatchingSnapshot();
  });

  it('makes a more complex job', () => {
    const job = new Job('test_job')
      .executor(docker)
      .checkout()
      .run('echo "hello, world"')
      .run({ command: 'echo "Job is over"', workingDirectory: '~/project' });

    expect(job.compose()).toMatchSnapshot();
  });

  it('can progressively restore a cache', () => {
    const job = new Job('test-job')
      .executor(docker)
      .progressiveRestoreCache('v1-this-is-a-test');

    expect(job.compose()).toMatchSnapshot();
  });

  it('can restore a cache progressively with a base', () => {
    const job = new Job('test-job')
      .executor(docker)
      .progressiveRestoreCache('v1-this-is-a-test', 'v1-this-is');

    expect(job.compose()).toMatchSnapshot();
  });

  it('can restore a cache progressively with no base (first item)', () => {
    const job = new Job('test-job')
      .executor(docker)
      .progressiveRestoreCache('v1-this-is-a-test', '');

    expect(job.compose()).toMatchSnapshot();
  });

  it('can be updated immutably', () => {
    const jobOne = new Job('test-job');
    const jobTwo = jobOne.progressiveRestoreCache('v1-this-is-a-test');

    expect(jobOne).not.toEqual(jobTwo);
  });
});
