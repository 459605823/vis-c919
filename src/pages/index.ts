import {LightManager, THREE, Viz} from '@f80975/viz.js';
import {componentManager} from './components';

const isDev = import.meta.env.DEV || window.location.search.includes('dev');
const lightManager = new LightManager();

export default class {
  viz: Viz;
  constructor(container: HTMLElement) {
    const viz = new Viz({
      container,
      dev: isDev,
    }, {
      componentManager,
      lightManager,
    });
    viz.assetManager.setAsset([
      {
        url: '/vis/c919.gltf',
        name: 'c919',
        type: 'gltf',
      },
    ]);
    this.viz = viz;
  }

  async init() {
    lightManager.createDirectionalLight({
      color: 0xFFFFFF,
      intensity: 3,
      position: new THREE.Vector3(0, 0, 10),
    });
    lightManager.createDirectionalLight({
      color: 0xFFFFFF,
      intensity: 3,
      position: new THREE.Vector3(0, 0, -10),
    });
    await this.viz.assetManager.load();
    await componentManager.draw('Plane');
    this.viz.start();
  }

  dispose() {
    this.viz.dispose();
  }
}
