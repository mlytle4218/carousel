/*
	Developed my Marc Lytle 2018
*/
// setting global variables here for control
// For the container the carousel will be in
var container;
var rotationRate = -0.005;
var speed = 0;
var radius = 15;
var cameraDistance = 35;



var inter;

// globals for mouse tracking
var mouseDown = false;
var mouseOver = false;
var timeStamp = null;
var prevMouseX = null;
var prevMouseY = null;
var averageX = [0, 0];
var averageY = [0, 0];


var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();


// For the basic scene elements *note: lessen this later
var camera, scene, renderer, light, mouse;

// For the images we will be rotating
var imagesArray;

// For some basic configuration *note: this is just to making changes easier later
var connectingElement = 'carousel';
var ambientLightColor = 0xffffff;


// The main entryway to the script
function start(fileArray) {
    // getting the container
    container = document.getElementById(connectingElement);
    imagesArray = createImagePlanes(fileArray);
    initCar(imagesArray);
    animateCar();
    window.addEventListener('mousedown', onMouseDown, false);

    window.addEventListener('mouseup', onMouseUp, false);

    window.addEventListener('mousemove', onMouseMove, false);

    window.addEventListener('mouseover', onMouseOver, false);
    window.addEventListener('mouseout', onMouseOff, false);
}

// takes an array with image file locations
// returns an array of plane geometries with the images grafted onto them.
function createImagePlanes(input) {
    var resultArray = [];
    var imageArray = [];

    input.files.forEach(function (element) {
        imageArray.push(element.pic);
    });

    input.files.forEach(function (element) {
        var loader = new THREE.TextureLoader();

        // Load image file into a custom material
        var material = new THREE.MeshLambertMaterial({
            map: loader.load(element.pic)
        });

        // Allow the transparencies to work
        material.transparent = true;

        // create a plane geometry for the image with a width of 10
        // and a height that preserves the image's aspect ratio
        var geometry = new THREE.PlaneGeometry(radius, radius);

        // combine our image geometry and material into a mesh
        var print = new THREE.Mesh(geometry, material);

        // set the position of the image mesh in the x,y,z dimensions
        print.position.set(0, -3, 0);
        print.url = element.url;

        resultArray.push(print);
    });
    return resultArray;
}

// function to load the obj model - this is a two part load - it takes
// relative path and for now just the basename of the files (ie you have
// a 'model.obj', and the accompanying 'model.mtl', pass the the path and 
// 'model' to the function. 
function loadObjModel(path) {

    var progress; // = console.log;

    return new Promise(function (resolve, reject) {
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath(path);
        mtlLoader.load(name + ".mtl", function (materials) {

            materials.preload();

            var objLoader = new THREE.OBJLoader();

            objLoader.setMaterials(materials);
            objLoader.setPath(path);
            objLoader.load(name + ".obj", resolve, progress, reject);

        }, progress, reject);
    });
}


function initCar(planesArray) {



    // setting up the camera - this position just looks a little better to me
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 100);
    camera.position.set(0, -2, cameraDistance);

    // Set up to track a mouse coordinates
    mouse = new THREE.Vector2();

    // setting the scene
    scene = new THREE.Scene();

    light = new THREE.AmbientLight(ambientLightColor);
    light.position.set(0, 10, 0);
    scene.add(light)


    // parent
    parent = new THREE.Object3D();
    scene.add(parent);

    var progress = 0;
    for (var i = 0; i < planesArray.length; i++) {
        var pivot = new THREE.Object3D();
        pivot.rotation.y = progress * Math.PI / planesArray.length;
        parent.add(pivot);
        planesArray[i].position.z = 15;
        planesArray[i].rotation.y = -progress * Math.PI / planesArray.length;
        pivot.add(planesArray[i]);
        progress += 2;
    }


    //set renderer
    this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.gammaOutput = true;
    container.appendChild(renderer.domElement);
}

window.addEventListener('resize', onWindowResize, false);



// adjusting to changes in the window
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// actually animating the scene including orbit changes

function animateCar() {


    requestAnimationFrame(animateCar);

    renderer.render(scene, camera);

    if (speed < 0.0001 || speed > 0.0001) {
        speed = speed * 0.99;
    }

    if (mouseOver) {
        rotateParent(getRotationRate() / 2);
    } else {
        rotateParent(getRotationRate());

    }

}

// function to register mouse location on click
function onMouseDown(event) {
    if (inContainer(event)) {
        mouseDown = true;
        averageX = [0, 0];
        averageY = [0, 0];

        event.preventDefault();

        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // calculate objects intersecting the picking ray
        var intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
            inter = intersects[0];
        }
    }
}

function onMouseUp(event) {
    mouseDown = false;
}

function onMouseMove(event) {
    if (mouseDown & inContainer(event)) {
        if (timeStamp === null) {
            timeStamp = Date.now();
            prevMouseX = event.clientX;
            prevMouseY = event.clientY;
            return;
        }

        var now = Date.now();
        var deltaT = now - timeStamp;
        var deltaX = event.clientX - prevMouseX;
        var speedX = Math.round(deltaX / deltaT * 100);

        averageX[0] += speedX;
        averageX[1]++;
        timeStamp = now;
        prevMouseX = event.clientX;
        prevMouseY = event.clientY;
        speed = ((averageX[0] / averageX[1]) / 1000) * 0.1;

        if ((speed * rotationRate) < 0) {
            rotationRate = rotationRate * -1;
        }

    }
}

function rotateParent(rotationAmount) {
    parent.rotation.y += rotationAmount;
    for (var i = 0; i < parent.children.length; i++) {
        parent.children[i].children[0].rotation.y += -rotationAmount;
    }
}

function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function onMouseOver(event) {

    if (inContainer(event)) {
        mouseOver = true;
    } else {
        mouseOver = false;
    }
}

function inContainer(event) {
    if (event.clientX > container.offsetLeft & event.clientX < container.offsetLeft + container.clientWidth) {
        if (event.clientY > container.offsetTop & event.clientY < container.offsetTop + container.clientHeight) {
            return true;
        }
    }
    return false;
}

function onMouseOff(event) {
    mouseOver = false;
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
