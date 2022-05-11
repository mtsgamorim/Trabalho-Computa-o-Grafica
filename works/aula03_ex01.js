import * as THREE from  'three';
import Stats from       '../build/jsm/libs/stats.module.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        InfoBox,
        onWindowResize,
        createGroundPlaneWired,
        createGroundPlaneXZ} from "../libs/util/util.js";

var scene = new THREE.Scene();    // Create main scene
var renderer = initRenderer();    // View function in util/utils
var camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
initDefaultBasicLight(scene);
var keyboard = new KeyboardState();

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls( camera, renderer.domElement );

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneWired(1000, 1000);
scene.add(plane);

// create a cube
var cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
scene.add(cameraHolder);
cameraHolder.translateY( 0 );
// position the cube

// add the cube to the scene


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

  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}

function keyboardUpdate() {

    keyboard.update();
  
    var speed = 30;
    var moveDistance = speed * clock.getDelta();
  
    // Keyboard.down - execute only once per key pressed
    if ( keyboard.down("left") )   cameraHolder.translateX( -1 );
    if ( keyboard.down("right") )  cameraHolder.translateX(  1 );
    if ( keyboard.down("up") )     cameraHolder.translateZ(  1 );
    if ( keyboard.down("down") )   cameraHolder.translateZ( -1 );
  
    // Keyboard.pressed - execute while is pressed
    if ( keyboard.pressed("A") )  cameraHolder.translateX( -moveDistance );
    if ( keyboard.pressed("D") )  cameraHolder.translateX(  moveDistance );
    if ( keyboard.pressed("W") )  cameraHolder.translateZ(  moveDistance );
    if ( keyboard.pressed("S") )  cameraHolder.translateZ( -moveDistance );
  
  }