/* @flow */

import Job from '../src/job';
import Docker from '../src/executors/docker';

const docker = new Docker('test-image:latest');

function p(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

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
});
