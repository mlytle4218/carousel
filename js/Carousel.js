/*
	Developed my Marc Lytle 2018
*/
// setting global variables here for control
// For the container the carousel will be in
var container;  
var rotationRate = -0.01;
var speed = 0; 
var deltaRotationRate = rotationRate + speed;
var wobbleConstant = 0.001;

// globals for mouse tracking
var mouseDown = false;
var timeStamp = null;
var prevMouseX = null;
var prevMouseY = null;
var averageX = [0,0];
var averageY = [0,0];


var wobbleProgress;

// For the basic scene elements *note: lessen this later
var camera, scene, renderer, light, mouse;

// For the images we will be rotating
var imagesArray;

// For some basic configuration *note: this is just to making changes easier later
var connectingElement = 'canvas';
var ambientLightColor = 0xffffff;


// The main entryway to the script
function start(fileArray) {
    imagesArray = createImagePlanes(fileArray);
    init(imagesArray);
    animate();
}

// takes an array with image file locations
// returns an array of plane geometries with the images grafted onto them.
function createImagePlanes(files) {
    var resultArray = [];
    files.forEach(element => {
        var loader = new THREE.TextureLoader();

        // Load image file into a custom material
        var material = new THREE.MeshLambertMaterial({
            map: loader.load(element)
        });

        // Allow the transparencies to work
        material.transparent = true;

        // create a plane geometry for the image with a width of 10
        // and a height that preserves the image's aspect ratio
        var geometry = new THREE.PlaneGeometry(10, 10);

        // combine our image geometry and material into a mesh
        print = new THREE.Mesh(geometry, material);

        // set the position of the image mesh in the x,y,z dimensions
        print.position.set(0, -2, 0)
        resultArray.push(print);
    });
    return resultArray;
}

function init(planesArray) {

    // getting the container
    container = document.getElementById(connectingElement);
    document.body.appendChild(container);

    // Setting the wobbleProgress now
    wobbleProgress = 0;

    // setting up the camera - this position just looks a little better to me
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 50);
    camera.position.set(0, -2, 30);

    // Set up to track a mouse coordinates
    mouse = new THREE.Vector2();

    // setting the scene
    scene = new THREE.Scene();
    var color = new THREE.Color(0xddddff);
    scene.background = color;

    light = new THREE.AmbientLight(ambientLightColor);
    light.position.set(0, 10, 0);
    scene.add(light)


    // parent
    parent = new THREE.Object3D();
    scene.add(parent);

    var progress = 0;
    for (var i= 0; i< planesArray.length; i++) {
        var pivot = new THREE.Object3D();
        pivot.rotation.y = progress * Math.PI / planesArray.length;
        parent.add(pivot);
        planesArray[i].position.z = 15;
        planesArray[i].rotation.y = -progress * Math.PI / planesArray.length;
        pivot.add(planesArray[i]);
        progress+=2;
    }


    //set renderer
    this.renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.gammaOutput = true;
    container.appendChild(renderer.domElement);
}

window.addEventListener('resize', onWindowResize, false);

window.addEventListener('mousedown', onMouseDown, false);

window.addEventListener('mouseup', onMouseUp, false);

window.addEventListener('mousemove', onMouseMove, false);

window.addEventListener('mouseover', onMouseOver, false);
window.addEventListener('mouseoff', onMouseOff, false);



// adjusting to changes in the window
function onWindowResize() {

    // camera.aspect = window.innerWidth / window.innerHeight;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight);


}

// actually animating the scene including orbit changes

function animate() {


    requestAnimationFrame(animate);

    renderer.render(scene, camera);

    if (speed < 0.0001 || speed > 0.0001) {
        speed = speed * 0.99;
    }

    rotateParent(getRotationRate());
    // parent.rotation.y += getRotationRate();
    // for (var i = 0; i < parent.children.length; i++ ) {
    //     parent.children[i].children[0].rotation.y += -getRotationRate();
    // }
    // wobbleProgress=  wobble(parent, wobbleProgress);

}

// function to register mouse location on click
function onMouseDown(event) {
    mouseDown = true;
    averageX = [0,0];
    averageY = [0,0];

    event.preventDefault();


}

function onMouseUp(event) {
    mouseDown = false;
}

function onMouseMove(event) {
    if (mouseDown){
        if (timeStamp === null) {
            timeStamp = Date.now();
            prevMouseX = event.clientX;
            prevMouseY = event.clientY;
            return;
        }
    
        var now = Date.now();
        var deltaT =  now - timeStamp;
        var deltaX = event.clientX - prevMouseX;
        var deltaY = event.clientY - prevMouseY;
        var speedX = Math.round(deltaX / deltaT * 100);
        var speedY = Math.round(deltaY / deltaT * 100);

        averageX[0] += speedX;
        averageX[1]++;
        timeStamp = now;
        prevMouseX = event.clientX;
        prevMouseY = event.clientY;
        speed = ((averageX[0]/averageX[1])/1000) * 0.1;

        if ((speed * rotationRate) < 0){
            rotationRate =  rotationRate * -1;
        }

        // parent.rotation.y += speedX;
        rotateParent(deltaX);
    }
}
function rotateParent(rotationAmount){
    parent.rotation.y += rotationAmount;
    for (var i = 0; i < parent.children.length; i++ ) {
        parent.children[i].children[0].rotation.y += -rotationAmount;
    }
}

function onMouseOver(event) {
    
}

function onMouseOff(event){

}

function getRotationRate() {
    if (mouseDown) {
        return 0;
    } else {
        if ((speed * rotationRate) < 0) {
            return -rotationRate + speed;
        }
        return rotationRate + speed;
    }
}

function wobble(object, progress){
    var wobbleTiming = 80
    if (progress >= wobbleTiming){
        progress = -1;
    } else if (progress < wobbleTiming/4 ) {
        object.rotation.x +=wobbleConstant;
        object.rotation.z +=wobbleConstant;
    } else if (progress < wobbleTiming/4*2) {
        object.rotation.x -=wobbleConstant;
        object.rotation.z -=wobbleConstant;
    } else if (progress < wobbleTiming) {
        // object.rotation.x +=wobbleConstant;
        // object.rotation.z +=wobbleConstant;
    }
    progress++;
    return progress;
}
