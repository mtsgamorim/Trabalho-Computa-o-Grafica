import * as THREE from  'three';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        InfoBox,
        onWindowResize, 
        degreesToRadians,
        createGroundPlaneXZ} from "../libs/util/util.js";

var scene = new THREE.Scene();    // Create main scene
var renderer = initRenderer();    // View function in util/utils
var camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
initDefaultBasicLight(scene);

// Use to scale the cube
var scale = 1.0;

// Show text information onscreen
showInformation();

// To use the keyboard
var keyboard = new KeyboardState();

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
var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
// position the cube
cube.position.set(0.0, 2.0, 0.0);
// add the cube to the scene
scene.add(cube);

var cubeAxesHelper = new THREE.AxesHelper(9);
cube.add(cubeAxesHelper);

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

render();

function keyboardUpdate() {
  
   keyboard.update();
  if ( keyboard.pressed("left") )     cube.translateX( -1 );
  if ( keyboard.pressed("right") )    cube.translateX(  1 );
  if ( keyboard.pressed("up") )       cube.translateY(  1 );
  if ( keyboard.pressed("down") )     cube.translateY( -1 );
  if ( keyboard.pressed("pageup") )   cube.translateZ(  1 );
  if ( keyboard.pressed("pagedown") ) cube.translateZ( -1 );

  let angle = degreesToRadians(10);
  if ( keyboard.pressed("A") )  cube.rotateY(  angle );
  if ( keyboard.pressed("D") )  cube.rotateY( -angle );

  if ( keyboard.pressed("W") )
  {
    scale+=.1;
    cube.scale.set(scale, scale, scale);
  }
  if ( keyboard.pressed("S") )
  {
    scale-=.1;
    cube.scale.set(scale, scale, scale);
  }
}

function showInformation()
{
  // Use this to show information onscreen
  var controls = new InfoBox();
    controls.add("Geometric Transformation");
    controls.addParagraph();
    controls.add("Use keyboard arrows to move the cube in XZ.");
    controls.add("Press Page Up or Page down to move the cube over the Y axis");
    controls.add("Press 'A' and 'D' to rotate.");
    controls.add("Press 'W' and 'S' to change scale");
    controls.show();
}

function render()
{
  trackballControls.update();
  keyboardUpdate();
  requestAnimationFrame(render); // Show events
  renderer.render(scene, camera) // Render scene
}
