/* @flow */

import type { Executor } from './';

type MachineData = {
  docker_layer_caching: boolean,
  enabled: boolean,
  image: string,
};

export default class Machine implements Executor {
  state: MachineData = {
    enabled: true,
    image: 'circleci/classic:latest',
    docker_layer_caching: false,
  };

  constructor(enabled: boolean = true) {
    this.state.enabled = enabled;
  }

  enabled(enabled: boolean) {
    this.state.enabled = enabled;
    return this;
  }

  image(image: string) {
    this.state.image = image;
    return this;
  }

  dockerLayerCaching(enabled: boolean) {
    this.state.docker_layer_caching = enabled;
  }

  compose() {
    return {
      machine: this.state,
    };
  }
}
