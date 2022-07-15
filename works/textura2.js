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

var textureLoader = new THREE.TextureLoader();
var floor = textureLoader.load('../assets/textures/wood.png');
var tampa = textureLoader.load('../assets/textures/woodtop.png');

const geometry2 = new THREE.CircleGeometry( 2, 32 );
const material2 = new THREE.MeshLambertMaterial();
material2.map = tampa
const circle = new THREE.Mesh( geometry2, material2 );
const circle2 = new THREE.Mesh( geometry2, material2 );



const geometry = new THREE.CylinderGeometry( 2, 2, 12, 32, 10, true );
const material = new THREE.MeshLambertMaterial( );
material.map = floor
const cylinder = new THREE.Mesh( geometry, material );
scene.add( cylinder );

cylinder.add( circle );
cylinder.add( circle2 );
circle.translateY(4)
circle2.translateY(4)
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