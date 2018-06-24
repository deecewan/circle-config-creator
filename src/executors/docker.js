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

  clone() {
    const clone = new this.constructor(this.data.image, this.parent);
    clone.data = { ...this.data };
    clone.parent = this.parent;

    return clone;
  }

  auth(auth: Auth) {
    const clone = this.clone();
    clone.data.auth = auth;

    return clone;
  }

  awsAuth(awsAuth: AwsAuth) {
    const clone = this.clone();
    clone.data.aws_auth = awsAuth;

    return clone;
  }

  command(...command: Array<string>) {
    const clone = this.clone();
    clone.data.command = command;

    return clone;
  }

  entrypoint(...entrypoint: Array<string>) {
    const clone = this.clone();
    clone.data.entrypoint = entrypoint;

    return clone;
  }

  environment(env: { [string]: string }) {
    const clone = this.clone();
    clone.data.environment = env;

    return clone;
  }

  name(name: string) {
    const clone = this.clone();
    clone.data.name = name;

    return clone;
  }

  user(user: string) {
    const clone = this.clone();
    clone.data.user = user;

    return clone;
  }

  compose() {
    return this.data;
  }

  done() {
    const clone = this.clone();
    clone.parent.images.push(clone);
    return clone.parent;
  }
}

export default class Docker implements Executor {
  images: Array<Image> = [];

  constructor(image: ?string) {
    if (image != null) {
      new Image(image, this).done();
    }
  }

  clone() {
    const clone = new this.constructor();
    clone.images = [...this.images];
    return clone;
  }

  image(image: string) {
    const clone = this.clone();
    return new Image(image, clone);
  }

  compose(): { docker: Array<ImageData> } {
    return {
      docker: this.images.map(i => i.compose()),
    };
  }
}
