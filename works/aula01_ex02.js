import * as THREE from  'three';
import Stats from       '../build/jsm/libs/stats.module.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";

var scene = new THREE.Scene();    // Create main scene
var renderer = initRenderer();    // View function in util/utils
var camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
initDefaultBasicLight(scene);

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls( camera, renderer.domElement );

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

// create a cube
var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
var cubeMaterial = new THREE.MeshNormalMaterial();
var sphereGeometry = new THREE.SphereGeometry( 3, 32, 16);
var sphereMaterial = new THREE.MeshNormalMaterial();
var cylinderGeometry = new THREE.CylinderGeometry( 2, 2, 4, 32 );
var cylinderMaterial = new THREE.MeshNormalMaterial();
var cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial);
var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);


// position the cube
cube.position.set(0.0, 2.0, 0.0);
sphere.position.set(5.0,3.0,5.0);
cylinder.position.set(-4.0,2.0,5.0);

// add the cube to the scene
scene.add(cube);
scene.add(sphere);
scene.add(cylinder);


// Use this to show information onscreen
var controls = new InfoBox();
  controls.add("Basic Scene");
  controls.addParagraph();
  controls.add("Use mouse to interact:");
  controls.add("* Left button to rotate");
  controls.add("* Right button to translate (pan)");
  controls.add("* Scroll to zoom in/out.");
  controls.show();

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

render();
function render()
{
  trackballControls.update(); // Enable mouse movements
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}