import {ComponentManager, Line} from '@f80975/viz.js';
import Plane from './plane';
import Ground from './ground';

export const componentManager = new ComponentManager({
  Plane,
  Ground,
  Line,
});
