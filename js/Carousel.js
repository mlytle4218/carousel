/*
	Developed my Marc Lytle 2018
*/
// setting global variables here for control
// For the container the carousel will be in
var container;  

// For the basic scene elements *note: lessen this later
var camera, scene, renderer, light;

// For the images we will be rotating
var imagesArray;

// For some basic configuration *note: this is just to making changes easier later
var connectingElement = 'canvas';
var ambientLightColor = 0xffffff;


// The main entryway to the script
function start(fileArray) {
    imagesArray = createImagePlanes(fileArray);
    init();
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

function init() {

    // getting the container
    container = document.getElementById(connectingElement);
    document.body.appendChild(container);

    // setting up the camera - this position just looks a little better to me
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 50);
    camera.position.set(0, 0, 30);

    // setting the scene
    scene = new THREE.Scene();
    var color = new THREE.Color(0xddddff);
    scene.background = color;

    light = new THREE.AmbientLight(ambientLightColor);
    light.position.set(0, 10, 0);
    scene.add(light)


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

}

// function to register mouse location on click
function onMouseDown(event) {

    event.preventDefault();


}
