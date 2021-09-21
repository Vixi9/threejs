import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';

let scene, camera, renderer, controls, speed;
let sun, car, terrain1, terrain2;

init();
animate();
console.log(scene.activeCamera);

function init() {

  // Textures
  const textureLoader = new THREE.TextureLoader();
  const height = textureLoader.load('assets/height.png');
  const alpha = textureLoader.load('assets/alpha.png');
  const texture = textureLoader.load('assets/sun.png')

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x250025);
  scene.fog = new THREE.Fog(0x250025, 25, 60);

  // Cameras
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.y = 1.5;
  camera.rotation.x = -0.1

  // Render
  renderer = new THREE.WebGLRenderer({
    physicallyCorrectLight: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.localClippingEnabled = true;
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 2.3;

  // Clipping
  const localPlane = new THREE.Plane( new THREE.Vector3( 0, 0, 1 ), 50 );
  
  // Sun
  sun = new THREE.Mesh(new THREE.CircleGeometry(8, 50, 0, Math.PI), new THREE.MeshStandardMaterial({
    map: texture,
    fog: false
  }));
  sun.position.z = -50;
  scene.add(sun);
  
  // Lights
  const sunLight = new THREE.SpotLight(0xFFF500);
  sunLight.position.set(0, 4, -50);
  sunLight.lookAt(0, 0, 0);
  scene.add(sunLight);

  const hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0x250025, 1);
  scene.add(hemisphereLight);
  
  // Terrain
  const terrainGeometry = new THREE.PlaneBufferGeometry(50, 50, 25, 25);
  const terrainMaterial = new THREE.MeshStandardMaterial({
      color: 0xFF71CE,
      wireframe: true,
      displacementMap: height,
      displacementScale: 5,
      clippingPlanes: [ localPlane ],
  });
  terrain1 = new THREE.Mesh(terrainGeometry, terrainMaterial);
  terrain1.rotation.x = Math.PI / 2;
  terrain1.rotation.y = Math.PI;
  terrain1.position.z = -25;

  terrain2 = new THREE.Mesh(terrainGeometry, terrainMaterial);
  terrain2.rotation.x = Math.PI / 2;
  terrain2.rotation.y = Math.PI;
  terrain2.position.z = -75;

  scene.add(terrain1, terrain2);

  // Car
  const colladaLoader = new ColladaLoader();
  colladaLoader.load('assets/models/testarossa.dae', function( object ) {
    car = object.scene;
    car.position.z = -4;
    car.position.y = 0.15;
    car.rotation.z = Math.PI;
    scene.add(car);
    console.log("Succesfuly loaded 3D models")
  }, 
  function ( xhr ) {
    console.log("Loading 3D models...")
  }, 
  function ( error ) {
    console.log(`Error during 3D models loading : ${error}`)
  });

  // GUI
  speed = {
    x: 0,
    y: 0,
    z: 0.1
  };

  const gui = new GUI();
  const speedFolder = gui.addFolder('Speed');
  speedFolder.add(speed, 'z', 0, 1, 0.1);
  const cameraPositionFolder = gui.addFolder('Camera position');
  cameraPositionFolder.add(camera.position, 'y', 0, 5, 0.25);
  cameraPositionFolder.open();
  const cameraRotationFolder = gui.addFolder('Camera rotation');
  cameraRotationFolder.add(camera.rotation, 'x', -Math.PI / 2, Math.PI / 2, 0.02)
  cameraRotationFolder.open();

  // HTML
  document.body.appendChild(renderer.domElement);

  //controls = new OrbitControls(camera, renderer.domElement);

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  requestAnimationFrame(animate);

  //controls.update();

  terrain1.position.z += speed.z;
  terrain2.position.z += speed.z;

  if(terrain1.position.z > 25) {
    terrain1.position.z = terrain2.position.z -50;
  }

  if(terrain2.position.z > 25) {
    terrain2.position.z = terrain1.position.z -50;
  }

  render();
}

function render() {
  renderer.render(scene, camera);
}