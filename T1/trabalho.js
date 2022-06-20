import * as THREE from  'three';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        InfoBox,
        onWindowResize,
        createGroundPlaneWired,
        createGroundPlaneXZ} from "../libs/util/util.js";
import createAviao from './criarAviao.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import { FogExp2, SplineCurve } from '../build/three.module.js';




var scene = new THREE.Scene();    // Create main scene
var renderer = initRenderer();    // View function in util/utils
var keyboard = new KeyboardState();
var clock = new THREE.Clock();
var camera = initCamera(new THREE.Vector3(0, 140, 40)); // Init camera in this position
let cont = 0;
initDefaultBasicLight(scene);

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls( camera, renderer.domElement );

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane1 = createGroundPlaneWired(400, 300, 10, 10, "rgb(0,128,0)");
let plane2 = createGroundPlaneWired(400, 300, 10, 10, "rgb(0,128,0)");
let plane3 = createGroundPlaneWired(400, 300, 10, 10, "rgb(0,128,0)");
scene.add(plane1);
scene.add(plane2);
scene.add(plane3);
plane2.translateY(300);
plane3.translateY(600);

// create a cube for camera
var cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
scene.add(cameraHolder);
cameraHolder.translateY( 0 );


let aviao = createAviao();
scene.add(aviao);

//criando a BB do aviao
let aviaoBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
aviaoBB.setFromObject(aviao);


let veloc = 2;
var sphereGeometry = new THREE.SphereGeometry( 1, 32, 1);
var sphereMaterial = new THREE.MeshLambertMaterial({color:"rgb(50,0,80)"})
let qntdTiro = 0;
let tiros = [];
let tirosBB = [];
for(let i = 0; i < 20; i++){
  tiros[i] = new THREE.Mesh(sphereGeometry, sphereMaterial);  
  //BB
  tirosBB[i] = new THREE.Sphere(tiros[i].position, 1)
}


function keyboardUpdate() {

  keyboard.update();

  var speed = 100;
  var moveDistance = speed * clock.getDelta();

  // Keyboard.pressed - execute while is pressed
  if ( keyboard.pressed("left") && aviao.position.x > -90)  aviao.translateX( -moveDistance );
  if ( keyboard.pressed("right") && aviao.position.x < 90)  aviao.translateX(  moveDistance );
  if ( keyboard.pressed("up") && aviao.position.z > cameraHolder.position.z - 40)  aviao.translateY(  moveDistance );
  if ( keyboard.pressed("down") && aviao.position.z < cameraHolder.position.z + 50)  aviao.translateY( -moveDistance );

  if (keyboard.down("space")) {
    
    tiros[qntdTiro].position.set(aviao.position.x , aviao.position.y , aviao.position.z )
    scene.add(tiros[qntdTiro]);
    if(qntdTiro === 19){
      qntdTiro = 0;
    }
    qntdTiro++;
    
  } 

  if (keyboard.down("ctrl")) {
    
    tiros[qntdTiro].position.set(aviao.position.x , aviao.position.y , aviao.position.z )
    scene.add(tiros[qntdTiro]);
    if(qntdTiro === 19){
      qntdTiro = 0;
    }
    qntdTiro++;
    
  } 


}

let velocidade = -0.2;
let animationOn = true;


function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
  // criação inimigo
  var geometryEnemy = new THREE.BoxGeometry(4, 4, 4);
  var materialEnemy = new THREE.MeshLambertMaterial({color:"rgb(200,0,0)"})
  //var enemy = new THREE.Mesh(geometryEnemy, materialEnemy);
  let enemys = [];
  let enemysBB = [];
  let contEnemy = 0;
  
  function createEnemy(){
    enemys.push(new THREE.Mesh(geometryEnemy, materialEnemy));
    enemysBB.push(new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()));
    enemysBB[contEnemy].setFromObject(enemys[contEnemy]);
    let posicaoX = getRandomArbitrary(-90, 90);
    let posicaoZ = cameraHolder.position.z - 45;
    enemys[contEnemy].position.set(posicaoX, 30, posicaoZ);
    scene.add(enemys[contEnemy]);
    contEnemy++;
  }
  //criação inimigo


//
let auxiliarPosCamera = 1;
let auxiliarEnemy1 = 1;

function andarCamera() {
  if(animationOn){
    cameraHolder.translateZ(velocidade);
    aviao.translateY(-velocidade);
    for(let i = 0; i < 20; i++){
      tiros[i].translateZ(-veloc);
      
      tirosBB[i].center.set(tiros[i].position.x, tiros[i].position.y, tiros[i].position.z )

      if(tiros[i].position.z < cameraHolder.position.z -50){
        scene.remove(tiros[i]);
      }
    }

    aviaoBB.copy( aviao.geometry.boundingBox).applyMatrix4(aviao.matrixWorld);

    for (let i = 0; i < enemys.length; i++){
      if(enemys[i] !== null){
      enemysBB[i].copy( enemys[i].geometry.boundingBox).applyMatrix4(enemys[i].matrixWorld);
      }
    }
   
    
    if(cameraHolder.position.z < (300 * -auxiliarPosCamera)){
      planoInfinito();
      auxiliarPosCamera++;
    }
    if(cameraHolder.position.z < (10 * -auxiliarEnemy1)){
      createEnemy();
      auxiliarEnemy1++;
    }
    for(let i = 0; i < enemys.length; i++){
      if(enemys[i] !== null){
        if(enemys[i].position.z > cameraHolder.position.z + 60){
          scene.remove(enemys[i]);
          enemys[i] = null;
        }
      }
    }

  }
}

function planoInfinito(){
    if(cont === 0){
      plane1.translateY(900)
      
    }else if(cont === 1){
      plane2.translateY(900);
    }else if(cont === 2){
      plane3.translateY(900);
    }
    cont++;
    if(cont === 3){
      cont = 0;
    }
}
 

function checkCollision() {
  
  //colisao entre o aviao e os inimigos
  for (let i = 0; i < enemys.length; i++){
    if(enemys[i] !== null){
      if(aviaoBB.intersectsBox(enemysBB[i])) {
        animationEndGame();
      }
    }
  } 

  for(let i = 0; i < enemys.length; i++){
    if(enemys[i] !== null) {
      for (let j = 0; j < 20; j++){
        if (enemysBB[i].intersectsSphere(tirosBB[j])){
        enemys[i].rotateZ(70);
        enemys[i].rotateY(40);
        setInterval(() => removeInimigo(i), 200);
        }
      }
    }
    } 
  }

function removeInimigo(i) {
  scene.remove(enemys[i]);
  scene.remove(enemysBB[i]);
  enemys[i] = null;
  //enemys.splice(i, 1);
  //enemysBB.splice(i, 1);
}

function animationEndGame(){
  alert("Game Over");
  keyboardUpdate() = false;
}

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

render();
function render()
{
  andarCamera();
  for(let i = 0; i < enemys.length; i++){
    if(enemys[i] !== null){
      enemys[i].translateZ(getRandomArbitrary(0.2, 1))
    }
  }
  checkCollision();
  requestAnimationFrame(render);
  keyboardUpdate();
  renderer.render(scene, camera) // Render scene
}


