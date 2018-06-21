/* @flow */

import Config from '../src';
import Workflow from '../src/workflow';
import Job from '../src/job';
import Machine from '../src/executors/machine';

describe('config', () => {
  it('creates a simple config', () => {
    const workflow = new Workflow('test-workflow').job(
      new Job('test-job')
        .checkout()
        .run('echo "hello, world"')
        .executor(new Machine()),
    );
    const c = new Config().workflow(workflow);

    expect(c.compose()).toMatchSnapshot();
  });
});
