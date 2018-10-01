/*
	Developed my Marc Lytle 2018
*/
// setting global variables here for control
// For the container the carousel will be in
var container;
var rotationRate = -0.005;
var speed = 0;
// var deltaRotationRate = rotationRate + speed;
// var wobbleConstant = 0.001;
var radius = 10;
var cameraDistance = 35;
var quickZoom = 35;


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
    imagesArray = createImagePlanes(fileArray);
    initCar(imagesArray);
    animateCar();
}

// takes an array with image file locations
// returns an array of plane geometries with the images grafted onto them.
function createImagePlanes(input) {
    var resultArray = [];

    input.files.forEach(function(element) {
        var loader = new THREE.TextureLoader();

        // Load image file into a custom material
        var material = new THREE.MeshLambertMaterial({
            map: loader.load(element.pic)
        });

        // Allow the transparencies to work
        material.transparent = true;

        // create a plane geometry for the image with a width of 10
        // and a height that preserves the image's aspect ratio
        var geometry = new THREE.PlaneGeometry(15, 15);

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

    // getting the container
    container = document.getElementById(connectingElement);
    // document.body.appendChild(container);
    // container.appendChild(renderer.domElement);

    // setting up the camera - this position just looks a little better to me
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 100);
    camera.position.set(0, -2, cameraDistance);

    // Set up to track a mouse coordinates
    mouse = new THREE.Vector2();

    // setting the scene
    scene = new THREE.Scene();
    // var color = new THREE.Color(0xddddff);
    // scene.background = color;

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

window.addEventListener('mousedown', onMouseDown, false);

window.addEventListener('mouseup', onMouseUp, false);

window.addEventListener('mousemove', onMouseMove, false);

window.addEventListener('mouseover', onMouseOver, false);
window.addEventListener('mouseout', onMouseOff, false);






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
        console.log(intersects[0]);
    }
}

function onMouseUp(event) {
    mouseDown = false;
}

function onMouseMove(event) {
    if (mouseDown) {
        if (timeStamp === null) {
            timeStamp = Date.now();
            prevMouseX = event.clientX;
            prevMouseY = event.clientY;
            return;
        }

        var now = Date.now();
        var deltaT = now - timeStamp;
        var deltaX = event.clientX - prevMouseX;
        var deltaY = event.clientY - prevMouseY;
        var speedX = Math.round(deltaX / deltaT * 100);
        var speedY = Math.round(deltaY / deltaT * 100);






        var left = Math.floor(container.clientWidth / 6) + container.offsetLeft;
        var middle = (Math.floor(container.clientWidth / 6) * 4) + container.offsetLeft + left;
        if (event.clientX > left & event.clientX < middle) {
            if (deltaX > 0) {
                var percent = (event.clientX - left) / (Math.floor(container.clientWidth / 6) * 4);
                rotateParent(percent * (Math.PI / 180));
            } else {
                var percent = (container.clientWidth - event.clientX - left) / (Math.floor(container.clientWidth / 6) * 4);
                rotateParent(-percent * (Math.PI / 180));
            }


        }


        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;





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
    var coords = {
        x: event.clientX,
        y: event.clientY
    }

    if (inContainer(coords)) {
        mouseOver = true;
    } else {
        mouseOver = false;
    }
}

function inContainer(coords) {
    if (coords.x > container.offsetLeft & coords.x < container.offsetLeft + container.clientWidth) {
        if (coords.y > container.offsetTop & coords.y < container.offsetTop + container.clientHeight) {
            return true;
        }
    }
    return false;
}

function onMouseOff(event) {
    console.log('mouseOut');
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


