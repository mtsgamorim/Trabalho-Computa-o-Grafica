//-- Imports -------------------------------------------------------------------------------------
import * as THREE from  'three';
import { VRButton } from '../build/jsm/webxr/VRButton.js';
import { onWindowResize } from "../libs/util/util.js";
import { setLookNonVRBehavior } from "../libs/util/utilVR.js";

//-- Setting renderer ---------------------------------------------------------------------------
let renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.xr.enabled = true;
	renderer.xr.setReferenceSpaceType( 'local' );

//-- Append renderer and create VR button -------------------------------------------------------
document.body.appendChild( renderer.domElement );
document.body.appendChild( VRButton.createButton( renderer ) );
window.addEventListener( 'resize', onWindowResize );

//-- Setting scene and camera -------------------------------------------------------------------
let scene = new THREE.Scene();
let clock = new THREE.Clock();
let camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
camera.layers.enable( 1 );

// To be used outside a VR environment (Desktop, for example)
let lookCamera = setLookNonVRBehavior(camera, renderer, "On desktop, press 'Q' or 'E' to fix orientation");

//-- Creating equirectangular Panomara ----------------------------------------------------------
const geometry = new THREE.SphereGeometry( 1000, 60, 60 );
	geometry.scale( - 1, 1, 1 ); // invert the geometry on the x-axis (faces will point inward)

const texture = new THREE.TextureLoader().load( '../assets/textures/panorama.jpg' );
const material = new THREE.MeshBasicMaterial( { map: texture } )
const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );

//-- Start main loop
renderer.setAnimationLoop( render );

function render() {
   // If VR Mode is OFF (desktop usage)
   if(!renderer.xr.isPresenting) 
      lookCamera.update(clock.getDelta()); 
	renderer.render( scene, camera );
}