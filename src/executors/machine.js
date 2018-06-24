/* @flow */

import type { Executor, MachineShape } from './types';

export default class Machine implements Executor {
  state: MachineShape = {
    enabled: true,
    image: 'circleci/classic:latest',
    docker_layer_caching: false,
  };

  constructor(enabled: boolean = true) {
    this.state.enabled = enabled;
  }

  clone() {
    const clone = new this.constructor(this.state.enabled);
    clone.state = {
      ...this.state,
    };

    return clone;
  }

  enabled(enabled: boolean) {
    const clone = this.clone();
    clone.state.enabled = enabled;
    return clone;
  }

  image(image: string) {
    const clone = this.clone();
    clone.state.image = image;
    return clone;
  }

  dockerLayerCaching(enabled: boolean) {
    const clone = this.clone();
    clone.state.docker_layer_caching = enabled;

    return clone;
  }

  compose() {
    return {
      machine: this.state,
    };
  }
}
