/* @flow */

import Job from '../src/job';
import Docker from '../src/executors/docker';

describe('Job', () => {
  it('can create a simple job', () => {
    const job = new Job('test_job')
      .executor(new Docker('test-image:latest'));
    expect(job.compose()).toMatchSnapshot();
  });

  it('complains if no executor', () => {
    const job = new Job('test_job');
    expect(() => job.compose()).toThrowErrorMatchingSnapshot();
  });
});
