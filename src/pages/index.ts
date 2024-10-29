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
      grid: false,
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
      {
        url: '/vis/env.jpg',
        name: 'envMap',
        type: 'texture',
      },
    ]);
    this.viz = viz;
  }

  async init() {
    await this.viz.assetManager.load();
    await this.loadEnvMap();
    await componentManager.draw('Plane');
    this.viz.start();
    this.setGui();
  }

  async loadEnvMap() {
    const pmremGenerator = new THREE.PMREMGenerator(this.viz.renderer!);
    pmremGenerator.compileEquirectangularShader();
    const texture = await this.viz.assetManager.getAsset<THREE.Texture>('envMap');
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    this.viz.scene!.environment = envMap;
    this.viz.scene!.environmentIntensity = 3;
    pmremGenerator.dispose();
  }

  setGui() {
    const guiManager = this.viz.guiManager;
    if (!guiManager)
      return;
    guiManager.addFolder('环境贴图', {
      environmentIntensity: {
        label: '环境光强度',
        value: this.viz.scene!.environmentIntensity,
        min: 0,
        max: 6,
        step: 0.1,
        onChange: (value: number) => {
          this.viz.scene!.environmentIntensity = value;
        },
      },
    });
  }

  dispose() {
    this.viz.dispose();
  }
}
