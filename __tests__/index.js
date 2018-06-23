/* @flow */

import fs from 'fs';
import Config from '../src';
import Workflow from '../src/workflow';
import Job from '../src/job';
import Machine from '../src/executors/machine';
import Docker from '../src/executors/docker';
import Branches from '../src/branches';

describe('config', () => {
  it('creates a simple config', () => {
    const workflow = new Workflow('test-workflow').job(new Job('test-job')
      .checkout()
      .run('echo "hello, world"')
      .executor(new Machine()));
    const c = new Config().workflow(workflow);

    expect(c.compose()).toMatchSnapshot();
  });

  function createComplexConfig() {
    const buildImage = new Docker()
      .image('ubuntu:14.04').done()
      .image('mongo:2.6.8')
      .command('mongod', '--smallfiles')
      .done()
      .image('postgres:9.4.1')
      .environment({ POSTGRES_USER: 'root' })
      .done()
      .image('redis@sha256:54057dd7e125ca41afe526a877e8bd35ec2cdd33b9217e022ed37bdcf7d09673')
      .done()
      .image('rabbitmq:3.5.4')
      .done();
    const branchesToIgnore = new Branches().ignore('develop', 'feature-.*');
    const masterBranch = new Branches().only('master');
    const stagingBranch = new Branches().only('staging');
    const deployImage = new Docker('ubuntu:14.04');

    const build = new Job('build')
      .executor(buildImage)
      .environment({ TEST_REPORTS: '/tmp/test-reports' })
      .workingDirectory('~/my-project')
      .branches(branchesToIgnore)
      .checkout()
      .run({ command: 'echo 127.0.0.1 devhost | sudo tee -a /etc/hosts' })
      .run('-u root createuser -h localhost --superuser ubuntu && sudo createdb -h localhost test_db')
      .progressiveRestoreCache('v1-my-project-{{ checksum "project.clj" }}', 'v1-my-project-')
      .run({
        environment: {
          SSH_TARGET: 'localhost',
          TEST_ENV: 'linux',
        },
        command: [
          'set -xu',
          'mkdir -p ${TEST_REPORTS}',
          'run-tests.sh',
          'cp out/tests/*.xml ${TEST_REPORTS}',
        ].join('\n'),
      })
      .run([
        'set -xu',
        'mkdir -p /tmp/artifacts',
        'create_jars.sh ${CIRCLE_BUILD_NUM}',
        'cp *.jar /tmp/artifacts',
      ].join('\n'))
      .saveCache('v1-my-project-{{ checksum "project.clj" }}', '~/.m2')
      .storeArtifacts('/tmp/artifacts', 'build')
      .storeTestResults('/tmp/test-reports');

    const deployStage = new Job('deploy-stage')
      .executor(deployImage)
      .workingDirectory('/tmp/my-project')
      .run({
        name: 'Deploy if tests pass and branch is Staging',
        command: 'ansible-playbook site.yml -i staging',
      });
    const deployProd = new Job('deploy-prod')
      .executor(deployImage)
      .workingDirectory('/tmp/my-project')
      .run({
        name: 'Deploy if tests pass and branch is Master',
        command: 'ansible-playbook site.yml -i production',
      });

    const config = new Config();
    const buildDeploy = new Workflow('build-deploy')
      .job(build)
      .job(deployStage, [build], stagingBranch)
      .job(deployProd, [build], masterBranch);
    config.workflow(buildDeploy);

    return config;
  }

  it('creates a more complex config', () => {
    const config = createComplexConfig();
    expect(config.compose()).toMatchSnapshot();
  });

  it('turns a complex config into yaml without error', () => {
    const config = createComplexConfig();
    expect(() => config.dump()).not.toThrowError();
  });
});
