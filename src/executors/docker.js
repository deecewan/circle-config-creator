/* @flow */

import type { Executor, ImageData, AwsAuth, Auth } from './types';

class Image {
  parent: Docker;

  data: ImageData;

  // eslint-disable-next-line no-use-before-define
  constructor(image: string, parent: Docker) {
    this.data = {
      image,
    };

    this.parent = parent;
  }

  auth(auth: Auth) {
    this.data.auth = auth;

    return this;
  }

  awsAuth(awsAuth: AwsAuth) {
    this.data.aws_auth = awsAuth;

    return this;
  }

  command(...command: Array<string>) {
    this.data.command = command;

    return this;
  }

  entrypoint(...entrypoint: Array<string>) {
    this.data.entrypoint = entrypoint;

    return this;
  }

  environment(env: { [string]: string }) {
    this.data.environment = env;

    return this;
  }

  name(name: string) {
    this.data.name = name;

    return this;
  }

  user(user: string) {
    this.data.user = user;

    return this;
  }

  compose() {
    return this.data;
  }

  done() {
    this.parent.images.push(this);
    return this.parent;
  }
}

export default class Docker implements Executor {
  images: Array<Image> = [];

  constructor(image: ?string) {
    if (image != null) {
      new Image(image, this).done();
    }
  }

  image(image: string) {
    return new Image(image, this);
  }

  compose(): { docker: Array<ImageData> } {
    return {
      docker: this.images.map(i => i.compose()),
    };
  }
}
