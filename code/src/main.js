/**
 * the OpenGL context
 * @type {WebGLRenderingContext}
 */
var gl = null,
  program = null;

// Camera
var camera = null;
var cameraPos = vec3.create();
var cameraCenter = vec3.create();
var cameraAnimation = null;

// Scenegraph root node
var root = null;

// Time in last render step
var previousTime = 0;

// Animation
var personAnimation = null;
var movementAnimation = null;


// Spotlight
var spotlight = null;

//treasurelight
var rotateLight = null;

// Camera variables
cHeight = 12
cAngle = 45

// MiniMap
var rootMinimap = null;

//CONSTANTS
const START = 2000;
const END = 25000;


//load the required resources using a utility function
loadResources({
  // shader for root and minimap
  vs: './src/shader/phong.vs.glsl',
  fs: './src/shader/phong.fs.glsl',
  //shader for light
  vs_single: './src/shader/single.vs.glsl',
  fs_single: './src/shader/single.fs.glsl',

  //minimap 
  vs_minimap: './src/shader/minimap.vs.glsl',
  fs_minimap: './src/shader/minimap.fs.glsl',

  //textures
  moonTexture: './src/models/textures/moon.png',
  leafeTexture: './src/models/textures/blatt.jpg',
  tribeTexture: './src/models/textures/stamm.jpg',
  treeTexture: './src/models/textures/tree.jpg',
  heavenTexture: './src/models/textures/heaven.jpg',
  grassTexture: './src/models/textures/grass.jpg',
  waterTexture: './src/models/textures/water.png',
  bridgeTexture: './src/models/textures/holz.jpg',

  //models
  moonModel: './src/models/moon.obj',
  treasureModel: './src/models/treasure.obj',
  treeModel: './src/models/tree.obj',
  leafeModel: './src/models/blatt.obj',
  tribeModel:  './src/models/stamm.obj',
  bridgeModel: './src/models/Stone Bridge_Obj.obj',
  upperBodyModel: './src/models/person/upperBody.obj',
  rightArmModel: './src/models/person/RightArm.obj',
  leftArmModel: './src/models/person/LeftArm.obj',
  rightLegModel: './src/models/person/RightLeg.obj',
  leftLegModel: './src/models/person/LeftLeg.obj',
  headModel: './src/models/person/Head.obj',
  flashlightModel: './src/models/person/Flashlight.obj'
}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);
  render(0);
});


function init(resources) {
  //create a GL context
  gl = createContext();

  //setup camera
  cameraStartPos = vec3.fromValues(-5, 4, 17);
  camera = new UserControlledCamera(gl.canvas, cameraStartPos);

  //setup an animation for the camera, moving it into position
  cameraAnimation = new Animation(camera,
    [
      {
        matrix: mat4.multiply(mat4.create(),
          mat4.translate(mat4.create(), mat4.create(), [-2, cHeight + 25, -25]),
          mat4.rotateX(mat4.create(), mat4.create(), glm.deg2rad(cAngle))), duration: 1
      },
      {
        matrix: mat4.multiply(mat4.create(),
          mat4.translate(mat4.create(), mat4.create(), [-2, cHeight + 25, -25]),
          mat4.rotateX(mat4.create(), mat4.create(), glm.deg2rad(cAngle))), duration: 999
      },
      {
        matrix: mat4.multiply(mat4.create(),
          mat4.translate(mat4.create(), mat4.create(), [0, cHeight, -8]),
          mat4.rotateX(mat4.create(), mat4.create(), glm.deg2rad(cAngle)),
          mat4.rotateY(mat4.create(), mat4.create(), glm.deg2rad(0))), duration: 1000
      },
      { // straight ahead
        matrix: mat4.multiply(mat4.create(),
          mat4.translate(mat4.create(), mat4.create(), [0, cHeight, 3]),
          mat4.rotateX(mat4.create(), mat4.create(), glm.deg2rad(cAngle))), duration: 4000
      },
      { // straight ahead
        matrix: progress => mat4.multiply(mat4.create(),
          mat4.translate(mat4.create(), mat4.rotateY(mat4.create(), mat4.create(), glm.deg2rad(-90)), [11, cHeight, (9 * progress)-5]),
          mat4.rotateX(mat4.create(), mat4.create(), glm.deg2rad(cAngle))), duration: 4500
      },
      { // straight ahead
        matrix: progress => mat4.multiply(mat4.create(),
          mat4.translate(mat4.create(), mat4.translate(mat4.create(), mat4.create(), [-15, cHeight, 11]), [0, 0, (5 * progress)-8]),
          mat4.rotateX(mat4.create(), mat4.create(), glm.deg2rad(cAngle))), duration: 4000
      },
      { // straight ahead
        matrix: progress => mat4.multiply(mat4.create(),
          mat4.translate(mat4.create(), mat4.rotateY(mat4.create(), mat4.create(), glm.deg2rad(90)), [-16, cHeight, (9 * progress)-22]),
          mat4.rotateX(mat4.create(), mat4.create(), glm.deg2rad(cAngle))), duration: 4500
      },
      { // straight ahead
        matrix: progress => mat4.multiply(mat4.create(),
          mat4.translate(mat4.create(), mat4.translate(mat4.create(), mat4.create(), [-16, cHeight, 4]), [11, 0, (12 * progress)+5]),
          mat4.rotateX(mat4.create(), mat4.create(), glm.deg2rad(cAngle))), duration: 4000
      },
      {
        matrix: progress => {
        const posMatrix = mat4.translate(mat4.create(), mat4.create(), [-5 * progress,cHeight * progress, 28]);
        const matrix = mat4.multiply(mat4.create(), mat4.rotateY(mat4.create(), posMatrix, glm.deg2rad(0)), 
        mat4.rotateX(mat4.create(), mat4.create(), glm.deg2rad(50 * progress)));
        return matrix;
      }, duration: 4000
      }
    ],
    false);
  
  //starts
  cameraAnimation.start()
  //create scenegraph
  root = createSceneGraph(gl, resources);

  //create Minimap
  rootMinimap = new Minimap(resources);
}


function createSceneGraph(gl, resources) {

  //create scenegraph
  const root = new ShaderSGNode(createProgram(gl, resources.vs, resources.fs))

  // creates moon for the scenesssssssssssss
    let moonLight = new LightSGNode();
    moonLight.uniform = 'u_light3';
    moonLight.ambient = [0.1, 0.1, 0.1, 1];
    moonLight.diffuse = [0.2, 0.2, 0.2, 1];
    moonLight.specular = [0.2, 0.2, 0.2, 1];
    moonLight.position = [-15, 15, 0];

  moonLight.append(createLightSphere(gl,resources,2));

  root.append(moonLight);

  createPerson(root, resources);
  createTreasure(root, resources);
  
  // creates the individual objects for the scene
  //trees before water
  //trees left
  createTrees(root, resources, 16, 10, 40, 1);
  createTrees(root, resources, 8, 5, 0, 0.8);
  createTrees(root, resources, 8, 14, 0, 0.8);
  createTrees(root, resources, 0, 13, 0, 0.7);
  //createTrees(root, resources, 0, 3, 45, 0.7);
  
  //trees right
  createTrees(root, resources, -11, 6, 0, 0.7);
  createTrees(root, resources, -19, 15, 30, 0.7);

  //trees after water
  //left
  createTrees(root, resources, 14, 35, -30, 0.7);
  //right
  createTrees(root, resources, -15, 35, -30, 0.7);

  createBridge(root, resources);
  
  //create Skybox
  createFloor(root, resources);
  createFrame(root, resources);

  return root;
}

function createTrees(root, resources, x,y, rotate, scale) {
    //create tree
    let tribe = new TransformationSGNode(glm.translate(0,0,0),
      [new MaterialSGNode([
        new AdvancedTextureSGNode(resources.tribeTexture,
          new RenderSGNode(resources.tribeModel))])]);
    //night-setting
    tribe.ambient = [0.3, 0.3, 0.3, 1];
    tribe.diffuse = [0.1, 0.1, 0.1, 1];
    tribe.specular = [0.5, 0.5, 0.5, 1];
    tribe.shininess = 4;  

    //create leafes
    let leafe = new TransformationSGNode(glm.translate(0,0,0),
      [new MaterialSGNode([
        new AdvancedTextureSGNode(resources.leafeTexture,
          new RenderSGNode(resources.leafeModel))])]);
    //night-setting
    leafe.ambient = [0.3, 0.3, 0.3, 1];
    leafe.diffuse = [0.1, 0.1, 0.1, 1];
    leafe.specular = [0.5, 0.5, 0.5, 1];
    leafe.shininess = 4; 

    root.append(new TransformationSGNode(glm.transform({ translate: [x, -1, y], rotateY: rotate, scale: scale }), [
      tribe
    ]));

    tribe.append(leafe);
}

function createBridge(root,resources){
  let bridge = new TransformationSGNode(glm.translate(0, 0, 0),
  [new MaterialSGNode([
    new AdvancedTextureSGNode(resources.bridgeTexture,
      new RenderSGNode(resources.bridgeModel))])]);
      //night-setting
      bridge.ambient = [0.3, 0.3, 0.3, 1];
      bridge.diffuse = [0.1, 0.1, 0.1, 1];
      bridge.specular = [0.5, 0.5, 0.5, 1];
      bridge.shininess = 4;  

root.append(new TransformationSGNode(glm.transform({ translate: [-5, 0, 25], rotateY: 90, scale: 0.1 }), [
  bridge
]));
}

function createTreasure(root,resources){

  let treasure = new MaterialSGNode([
    new RenderSGNode(resources.treasureModel)
  ]);
  
  //gold material
  treasure.ambient = [0.24725, 0.1995, 0.0745, 1];
  treasure.diffuse = [0.75164, 0.60648, 0.22648, 1];
  treasure.specular = [0.628281, 0.555802, 0.366065, 1];
  treasure.shininess = 50;

  root.append(new TransformationSGNode(glm.transform({ translate: [-5,0,35], rotateY: 0, rotateX: 90, rotateZ: 180 , scale: -0.05}), [
    treasure
  ]));

//-------------  
// creates light for treasure
// the light revolves around the treasure 
let treasureLight = new LightSGNode();
treasureLight.uniform = 'u_light2';
treasureLight.ambient = [.05, .05, .05, 1];
treasureLight.diffuse = [0.5, 0.5, 0.5, 1];
treasureLight.specular = [1, 1, 1, 1];
treasureLight.position = [0, 1, 4];
treasureLight.append(createLightSphere(gl,resources, 0.4));


rotateLight = new TransformationSGNode(mat4.create(), [
  treasureLight
]);

root.append(rotateLight);

lightAnimation = new Animation(rotateLight, [
  { matrix: progress => mat4.rotateY(
        mat4.create(), //output
        mat4.translate(mat4.create(), mat4.create(), [-5, 1, 35]), // matrix to tanslate
        glm.deg2rad(-360 * progress) //translation
      ), duration: 3000 },
  ],
  true);
lightAnimation.start();


}

//create light sphere 
function createLightSphere(gl, resources, size) {
  return new ShaderSGNode(createProgram(gl, resources.vs_single, resources.fs_single), [
    new RenderSGNode(makeSphere(size, 10, 10))
  ]);
}

function createPerson(root, resources) {
  // create spotLight
  spotlight = new LightSGNode();
  spotlight.ambient = [.05, .05, .05, 1];
  spotlight.diffuse = [0.5, 0.5, 0.5, 1];
  spotlight.specular = [1, 1, 1, 1];
  spotlight.position = [0, 0, 0.75];
  spotlight.limit = 0.6;
  spotlight.lightDir = [0 , 1, 0];
  spotlight.append(createLightSphere(gl, resources, 0.2));

  let upperBodyNode = new MaterialSGNode([
      new RenderSGNode(resources.upperBodyModel)
  ]);

  upperBodyNode.ambient = [0.2, 0.0, 0.0, 1];
  upperBodyNode.diffuse = [0.8, 0.0, 0.0, 1];
  upperBodyNode.specular = [1.0, 0.5, 0.5, 1];
  upperBodyNode.shininess = 40;

  let headNode = new MaterialSGNode([
    new RenderSGNode(resources.headModel)
  ]);
  //skin material
  headNode.ambient = [0.396, 0.263, 0.129, 1];
  headNode.diffuse = [0.753, 0.608, 0.349, 1];
  headNode.specular = [0.628, 0.555, 0.366, 1];
  headNode.shininess = 50;
  
  const headTransformationNode = new TransformationSGNode(glm.translate(0, 0.4, 0.05), [
    headNode,
  ]);

  let leftArmNode = new MaterialSGNode([
    new RenderSGNode(resources.leftArmModel)
  ]);

  leftArmNode.ambient = [0.2, 0.0, 0.0, 1];
  leftArmNode.diffuse = [0.8, 0.0, 0.0, 1];
  leftArmNode.specular = [1.0, 0.5, 0.5, 1];
  leftArmNode.shininess = 30;

  //for holding the flashlight
  let leftArmTransformationNode = new TransformationSGNode(glm.translate(0.77, 0.33, 0), [
    leftArmNode
  ]);

  let rightArmNode = new MaterialSGNode([
    new RenderSGNode(resources.rightArmModel)
  ]);

  rightArmNode.ambient = [0.2, 0.0, 0.0, 1];
  rightArmNode.diffuse = [0.8, 0.0, 0.0, 1];
  rightArmNode.specular = [1.0, 0.5, 0.5, 1];
  rightArmNode.shininess = 30;

  let flashLightNode = new MaterialSGNode([
    new RenderSGNode(resources.flashlightModel)
  ]);
  flashLightNode.ambient = [0.2, 0.2, 0.2, 1];
  flashLightNode.diffuse = [0.6, 0.6, 0.6, 1];
  flashLightNode.specular = [0.8, 0.8, 0.8, 1];
  flashLightNode.shininess = 50;
  const flashLightTransformationNode = new TransformationSGNode(glm.translate(0, -1.05, 0.45), [
    flashLightNode,
    spotlight
  ]);

  let rightArmTransNode = new TransformationSGNode(glm.translate(-0.77, 0.33, 0), [
    rightArmNode,
    flashLightTransformationNode
  ]);
  

  let leftLegNode = new MaterialSGNode([
    new RenderSGNode(resources.leftLegModel)
  ]);

  leftLegNode.ambient = [0.75275, 0.8005, 0.9255, 1];
  leftLegNode.diffuse = [0.24836, 0.39352, 0.77352, 1];
  leftLegNode.specular = [0.371719, 0.44198, 0.633935, 1];
  leftLegNode.shininess = 10;

  let leftLegTransformationNode = new TransformationSGNode(glm.translate(0.3, -0.6, 0.05), [
    leftLegNode
  ]);

  let rightLegNode = new MaterialSGNode([
    new RenderSGNode(resources.rightLegModel)
  ]);

  rightLegNode.ambient = [0.75275, 0.8005, 0.9255, 1];
  rightLegNode.diffuse = [0.24836, 0.39352, 0.77352, 1];
  rightLegNode.specular = [0.371719, 0.44198, 0.633935, 1];
  rightLegNode.shininess = 10;

  let rightLegTransformationNode = new TransformationSGNode(glm.translate(-0.3, -0.6, 0.05), [
    rightLegNode
  ]);

  let personTransformationNode = new TransformationSGNode(glm.translate(0, 2.5, 0), [
    upperBodyNode,
    headTransformationNode,
    leftArmTransformationNode,
    rightArmTransNode,
    leftLegTransformationNode,
    rightLegTransformationNode,
  ]);

  let transformationNode = new TransformationSGNode(glm.translate(0, 0, 0), [
    personTransformationNode,
  ]);

  // add person to scenegraph
  root.append(transformationNode);  

  movementAnimation = getMovement(rightLegTransformationNode, leftLegTransformationNode, leftArmTransformationNode);
  
  movementAnimation.start();
  

  personAnimation = new Animation(transformationNode,
    [
      { matrix: progress => mat4.translate(mat4.create(), mat4.create(), [0, 0, 0]), duration: 2000 },
      { matrix: progress => mat4.translate(mat4.create(), mat4.create(), [0, 0, 12 * progress]), duration: 3500 },
      // turn right
      { matrix: progress => mat4.rotateY(mat4.create(), mat4.translate(mat4.create(), mat4.create(), [0, 0, 11]), glm.deg2rad(-90 * progress)), duration: 500 },
      //go straight ahead
      { matrix: progress => mat4.translate(mat4.create(), mat4.rotateY(mat4.create(), mat4.create(), glm.deg2rad(-90)), [11, 0, 15 * progress]), duration: 4000 },
      // turn left
      { matrix: progress => mat4.rotateY(mat4.create(), mat4.translate(mat4.create(), mat4.rotateY(mat4.create(), mat4.create(), glm.deg2rad(-90)), [11, 0, 15]), glm.deg2rad(90 * progress)), duration: 500 },
      // straight ahead
      { matrix: progress => mat4.translate(mat4.create(), mat4.translate(mat4.create(), mat4.create(), [-15, 0, 11]), [0, 0, 5 * progress]), duration: 3500 },
      // turn left
      { matrix: progress => mat4.rotateY(mat4.create(), mat4.translate(mat4.create(), mat4.create(), [-15, 0, 16]), glm.deg2rad(90 * progress)), duration: 500 },
      // straight ahead
      { matrix: progress => mat4.translate(mat4.create(), mat4.rotateY(mat4.create(), mat4.create(), glm.deg2rad(90), [-15, 0, -16]), [-16, 0, (10.5 * progress)-15]), duration: 4000 },
      // turn right
      { matrix: progress => mat4.rotateY(mat4.create(), mat4.translate(mat4.create(), mat4.rotateY(mat4.create(), mat4.create(), glm.deg2rad(90)), [-16, 0, -4.5]), glm.deg2rad(-90 * progress)), duration: 500 },      
      //straight ahead -> bridge
      { matrix: progress => mat4.translate(mat4.create(), mat4.translate(mat4.create(), mat4.create(), [-16, 0, 4.5]), [11, 0, (12 * progress)+11]), duration: 4000 }
    ],
    false);

  personAnimation.start();


}

/**
 * render one frame
 */
function render(timeInMilliseconds) {
  // check for resize of browser window and adjust canvas sizes
  checkForWindowResize(gl);

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.9, 0.9, 0.9, 1.0); //light color
  //gl.clearColor(0, 0, 0, 1.0); //black
  //clear the buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //enable depth test to let objects in front occluse objects further away
  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.SCISSOR_TEST);

  //setup context and camera matrices
  const context = createSGContext(gl);
  context.projectionMatrix = mat4.perspective(mat4.create(), glm.deg2rad(30), gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 100);
  context.viewMatrix = mat4.lookAt(mat4.create(), [0, 1, -10], [0, 0, 0], [0, 1, 0]);

  spotlight.lightViewProjectionMatrix = mat4.multiply(mat4.create(), context.projectionMatrix, context.viewMatrix);

  var deltaTime = timeInMilliseconds - previousTime;
  previousTime = timeInMilliseconds;

  // update animations
  personAnimation.update(deltaTime);
  movementAnimation.update(deltaTime, timeInMilliseconds);

  // Rotation for the treasure light
  lightAnimation.update(deltaTime);

  //update animation BEFORE camera
  cameraAnimation.update(deltaTime);
  camera.update(deltaTime);


  //At the end of the automatic flight, switch to manual control
  if (!cameraAnimation.running && !camera.control.enabled) {
    camera.control.enabled = true;
  }

  //Apply camera
  camera.render(context);

  //Render scene
  root.render(context);

  //Render Minimap
  rootMinimap.render(context, timeInMilliseconds);

  //request another call as soon as possible
  requestAnimationFrame(render);
}

function createFloor(root, resources) {
  //create floor grass 1
  let floor = new MaterialSGNode([
    new AdvancedTextureSGNode(resources.grassTexture,
      new RenderSGNode(makeRect(40, 20)))
  ]);

  //night-setting
  floor.ambient = [0.2, 0.2, 0.2, 1];
  floor.diffuse = [0.1, 0.1, 0.1, 1];
  floor.specular = [0.5, 0.5, 0.5, 1];
  floor.shininess = 3;
  // add grass to scenegraph
  root.append(new TransformationSGNode(glm.transform({ translate: [0, 0, 0], rotateX: -90, scale: 1 }), [ //translate = position
    floor
  ]));

  // create floor water
  let floorWater = new MaterialSGNode([
    new AdvancedTextureSGNode(resources.waterTexture,
      new RenderSGNode(makeRect(40, 5)))
  ]);
  //night-setting
  floorWater.ambient = [0.2, 0.2, 0.2, 1];
  floorWater.diffuse = [0.1, 0.1, 0.1, 1];
  floorWater.specular = [0.5, 0.5, 0.5, 1];
  floorWater.shininess = 3;

  //add water to scenegraph
  root.append(new TransformationSGNode(glm.transform({ translate: [0, 0.05, 25], rotateX: -90, scale: 1 }), [
    floorWater
  ]));

  //create floor grass 2
  //add grass to scenegraph
  root.append(new TransformationSGNode(glm.transform({ translate: [0, 0, 25], rotateX: -90, scale: 1 }), [
    floor
  ]));
}

function createFrame(root, resources) {
  //create front-border
  let front = new MaterialSGNode([
    new AdvancedTextureSGNode(resources.heavenTexture,
      new RenderSGNode(makeRect(40, 10)))
  ]);
  //night-setting
  front.ambient = [0.2, 0.2, 0.2, 1];
  front.diffuse = [0.1, 0.1, 0.1, 1];
  front.specular = [0.5, 0.5, 0.5, 1];
  front.shininess = 5;
  //add front-border to scenegraph
  root.append(new TransformationSGNode(glm.transform({ translate: [0, 10, 40], rotateY: 180, scale: 1 }), [ //rotate Y to have the front side of the texture
    front
  ]));

  //create back-border
  let back = new MaterialSGNode([
    new AdvancedTextureSGNode(resources.heavenTexture,
      new RenderSGNode(makeRect(40, 10)))
  ]);
  //night-setting
  back.ambient = [0.2, 0.2, 0.2, 1];
  back.diffuse = [0.1, 0.1, 0.1, 1];
  back.specular = [0.5, 0.5, 0.5, 1];
  back.shininess = 5;
  //add back-border to scenegraph
  root.append(new TransformationSGNode(glm.transform({ translate: [0, 10, -10], rotateY: 0, scale: 1 }), [ //rotate Y to have the front side of the texture
    back
  ]));

  //create right-border 
  let right = new MaterialSGNode([
    new AdvancedTextureSGNode(resources.heavenTexture,
      new RenderSGNode(makeRect(40, 10)))
  ]);

  //night-setting
  right.ambient = [0.2, 0.2, 0.2, 1];
  right.diffuse = [0.1, 0.1, 0.1, 1];
  right.specular = [0.5, 0.5, 0.5, 1];
  right.shininess = 5;
  // add right-border to scenegraph
  root.append(new TransformationSGNode(glm.transform({ translate: [-40, 10, 0], rotateY: 90, scale: 1 }), [ //rotate Y to have the front side of the texture
    right
  ]));

  //create left-border
  let left = new MaterialSGNode([
    new AdvancedTextureSGNode(resources.heavenTexture,
      new RenderSGNode(makeRect(40, 10)))
  ]);
  //night-setting
  left.ambient = [0.2, 0.2, 0.2, 1];
  left.diffuse = [0.1, 0.1, 0.1, 1];
  left.specular = [0.5, 0.5, 0.5, 1];
  left.shininess = 5;

  //add left-border to scenegraph
  root.append(new TransformationSGNode(glm.transform({ translate: [40, 10, 0], rotateY: -90, scale: 1 }), [ //rotate Y to have the front side of the texture
    left
  ]));
}

function getMovement(rightLeg, leftLeg, leftArm) {

  const movementAnimation = new Movement();  
  movementAnimation.add(new Animation(rightLeg,
    [ 
      {matrix: progress =>  mat4.rotateX(mat4.create(), mat4.translate(mat4.create(), mat4.create(), [-0.3, -0.6, 0.05]), glm.deg2rad(90 * progress)), duration: 500},
      {matrix: progress =>  mat4.rotateX(mat4.create(), mat4.rotateX(mat4.create(), mat4.translate(mat4.create(), mat4.create(), [-0.3, -0.6, 0.05]), glm.deg2rad(90)), glm.deg2rad(-90 * progress)), duration: 500},
      {matrix: progress =>  mat4.rotateX(mat4.create(), mat4.translate(mat4.create(), mat4.create(), [-0.3, -0.6, 0.05]), glm.deg2rad(-90 * progress)), duration: 500},
      {matrix: progress =>  mat4.rotateX(mat4.create(), mat4.rotateX(mat4.create(), mat4.translate(mat4.create(), mat4.create(), [-0.3, -0.6, 0.05]), glm.deg2rad(-90)), glm.deg2rad(90 * progress)), duration: 500},
    ], 
    true));

    
    movementAnimation.add(new Animation(leftLeg,
    [
      {matrix: progress =>  mat4.rotateX(mat4.create(), mat4.translate(mat4.create(), mat4.create(), [0.3, -0.6, 0.05]), glm.deg2rad(-90 * progress)), duration: 500},
      {matrix: progress =>  mat4.rotateX(mat4.create(), mat4.rotateX(mat4.create(), mat4.translate(mat4.create(), mat4.create(), [0.3, -0.6, 0.05]), glm.deg2rad(-90)), glm.deg2rad(90 * progress)), duration: 500},
      {matrix: progress =>  mat4.rotateX(mat4.create(), mat4.translate(mat4.create(), mat4.create(), [0.3, -0.6, 0.05]), glm.deg2rad(90 * progress)), duration: 500},
      {matrix: progress =>  mat4.rotateX(mat4.create(), mat4.rotateX(mat4.create(), mat4.translate(mat4.create(), mat4.create(), [0.3, -0.6, 0.05]), glm.deg2rad(90)), glm.deg2rad(-90 * progress)), duration: 500},
    ],
    true));

    movementAnimation.add(new Animation(leftArm,
    [ 
      {matrix: progress =>  mat4.rotateX(mat4.create(), mat4.translate(mat4.create(), mat4.create(), [0.77,0.33,0]), glm.deg2rad(90 * progress)), duration: 500},
      {matrix: progress =>  mat4.rotateX(mat4.create(), mat4.rotateX(mat4.create(), mat4.translate(mat4.create(), mat4.create(), [0.77,0.33,0]), glm.deg2rad(90)), glm.deg2rad(-90 * progress)), duration: 500},
      {matrix: progress =>  mat4.rotateX(mat4.create(), mat4.translate(mat4.create(), mat4.create(), [0.77,0.33,0]), glm.deg2rad(-90 * progress)), duration: 500},
      {matrix: progress =>  mat4.rotateX(mat4.create(), mat4.rotateX(mat4.create(), mat4.translate(mat4.create(), mat4.create(), [0.77,0.33,0]), glm.deg2rad(-90)), glm.deg2rad(90 * progress)), duration: 500},
    ], 
    true));

    return movementAnimation;
}


// This class is important for moving the individual
// body parts (both legs and left arm)
class Movement {
  
  bodyParts;

  constructor() {
    this.bodyParts = [];
  }

  add(animation) {
    this.bodyParts.push(animation);
  }

  start() {
    this.bodyParts.forEach(a => {
      if (!a.running) a.start();
    });
  }

  stopMovement() {
    this.bodyParts.forEach(a => {
      if (a.running) a.running = false;
    });
  }

  update(deltaTimeInMilliseconds, timeinMs) {
    if (timeinMs < START) {
      this.stopMovement();
   }else if(timeinMs > END){
    this.stopMovement();
   }else {
      this.start();
      this.bodyParts.forEach(a => {
        if (a.running) a.update(deltaTimeInMilliseconds);
      });
    }
  }
}