import {Viz} from '@f80975/viz.js';
import {componentManager} from './components';

export default class {
  viz: Viz;
  constructor(container: HTMLElement) {
    const viz = new Viz({
      container,
    }, {
      componentManager,
    });
    viz.assetManager.setAsset([
      {
        url: '/vis/c919.gltf',
        type: 'gltf',
      },
    ]);
    this.viz = viz;
  }

  init() {
    this.viz.start();
  }

  dispose() {
    this.viz.dispose();
  }
}
