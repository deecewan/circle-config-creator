/* @flow */

export type Auth = { password: string, username: string };
export type AwsAuth = { aws_access_key_id: string, aws_secret_access_key: string };

export type ImageData = {
  auth?: Auth,
  aws_auth?: AwsAuth,
  command?: Array<string>,
  entrypoint?: Array<string>,
  environment?: { [string]: string },
  image: string,
  name?: string,
  user?: string,
};

export type Version =
  | '9.4.0'
  | '9.3.1'
  | '9.3.0'
  | '9.2.0'
  | '9.1.0'
  | '9.0.1'
  | '8.3.3';

export type MacOSShape = {
  xcode: Version,
};

export type MachineShape = {
  docker_layer_caching: boolean,
  enabled: boolean,
  image: string,
};

export interface Executor {
  compose():
    | { macos: MacOSShape }
    | { machine: MachineShape }
    | { docker: Array<ImageData> },
}
