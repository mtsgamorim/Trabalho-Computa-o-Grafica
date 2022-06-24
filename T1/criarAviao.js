import * as THREE from "three";
import Stats from "../build/jsm/libs/stats.module.js";
import { TrackballControls } from "../build/jsm/controls/TrackballControls.js";
import KeyboardState from "../libs/util/KeyboardState.js";
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  InfoBox,
  onWindowResize,
  createGroundPlaneWired,
  degreesToRadians,
  createGroundPlaneXZ,
} from "../libs/util/util.js";

export default function createAviao() {
  var geometry = new THREE.ConeGeometry(3, 8, 32);
  var material = new THREE.MeshLambertMaterial({
    color: 0x0000ff,
    visible: false,
  });
  var cone = new THREE.Mesh(geometry, material);

  cone.position.set(0, 30, 0);

  let angle = degreesToRadians(-90);
  cone.rotateX(angle);

  // scene.add(cone);
  return cone;
}
