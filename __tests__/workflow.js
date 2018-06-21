/* @flow */

import Workflow from '../src/workflow';
import Job from '../src/job';
import Branches from '../src/branches';

function p(obj) {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(obj, null, 2));
}

describe('Workflow', () => {
  it('can create a simple workflow', () => {
    const w = new Workflow('test-workflow');

    const job = new Job('test-job');

    expect(w.job(job).compose()).toMatchSnapshot();
  });

  it('can require another job to run', () => {
    const w = new Workflow('test-workflow');

    const job = new Job('test-job');
    const requires = new Job('required-by-test-job');

    expect(w.job(job, [requires]).compose()).toMatchSnapshot();
  });

  it('can take triggers', () => {
    const branches = new Branches().only('test-branch');

    const w = new Workflow('test-workflow');
    w.schedule('* * * * *', branches);

    expect(w.compose()).toMatchSnapshot();
  });
});

