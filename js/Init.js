// configuration variables
var radius = 430;
var objectRadius = 400;
var cameraDistance = 1000;
var rotationRate = -0.005;
var ambientLightColor = 0xffffff;


// global models
var renderer;
var scene;
var camera;
var container;
var mouseOver;
var mouseDown;
var animateModels;
var planeCasters = [];

var raycaster = new THREE.Raycaster();


var connectingElement = 'carousel';

function start(fileArray){
    var imagesArray = createImagePlanes(fileArray);

    container = document.getElementById(connectingElement);

    container.addEventListener('mousedown', onMouseDown, false);
    container.addEventListener('mouseup', onMouseUp, false);
    container.addEventListener('mousemove', onMouseMove, false);
    container.addEventListener('mouseover', onMouseOver, false);
    container.addEventListener('mouseout', onMouseOff, false);
    window.addEventListener('resize', onWindowResize, false);

    initCarousel(imagesArray);
}
function initCarousel(planesArray){

    // setting up the camera - this position just looks a little better to me
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 2000);
    camera.position.set(0, -2, cameraDistance);

    // Set up to track a mouse coordinates
    mouse = new THREE.Vector2();

    // setting the scene
    scene = new THREE.Scene();

    // setting minimal light
    light = new THREE.AmbientLight(ambientLightColor);
    light.position.set(0, 10, 0);
    scene.add(light);


    // parent
    parent = new THREE.Object3D();
    scene.add(parent);

    var progress = 0;
    for (var i = 0; i < planesArray.length; i++) {
        var pivot = new THREE.Object3D();
        pivot.rotation.y = progress * Math.PI / planesArray.length;
        parent.add(pivot);
        planesArray[i].position.z = objectRadius;
        planesArray[i].rotation.y = -progress * Math.PI / planesArray.length;
        pivot.add(planesArray[i]);
        progress += 2;
    }




    //set renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor( 0x000000, 0 ); 
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.gammaOutput = true;
    container.appendChild(renderer.domElement);


    animateModels = new AnimateModels(rotationRate);

    animateCarousel();
}

function animateCarousel(){
    animateModels.tick();
    requestAnimationFrame(animateCarousel);
    renderer.render(scene, camera);
}

function createImagePlanes(input){
    var resultArray = [];
    input.files.forEach(function (element, it) {
        var textLoader = new THREE.TextureLoader();

        var printMaterial = new THREE.MeshLambertMaterial({
            map: textLoader.load(element.pic)
        });

        printMaterial.transparent = true;

        var printGeometry  = new THREE.PlaneBufferGeometry(radius, radius); 

        // The shoe print to which the other objects will adhere
        var print = new THREE.Mesh(printGeometry, printMaterial);

        print.position.set(0.-3,0);
        print.animating = 0;
        print.name = element.pic;

        var svgLoader = new THREE.SVGLoader();
        svgLoader.load( element.svg, paths => {
            var group = new THREE.Group();
            group.scale.multiplyScalar( 0.25 );
            group.position.x = - 70;
            group.position.y = 70;
            group.scale.y *= -1;

            for ( var i = 0; i < paths.length; i ++ ){
                var path = paths[ i ];

                var svgMaterial = new THREE.MeshBasicMaterial({
                    color:  path.color,
                    side: THREE.DoubleSide
                });

                var shapes = path.toShapes( true );
                for ( var j = 0; j < shapes.length; j++ ){
                    var shape = shapes[ j ];
                    var svgGeometry = new THREE.ShapeBufferGeometry( shape );
                    var svgMesh = new THREE.Mesh(svgGeometry, svgMaterial);
                    svgMesh.material.visible = false;

                    group.add( svgMesh );

                }
            }

            svgLoader.load( element.shop, function ( paths ){
                for ( var i = 0; i < paths.length; i++ ){
                    var path = paths[ i ];

                    var buttonMaterial = new THREE.MeshBasicMaterial({
                        color: path.color,
                        side: THREE.DoubleSide
                    });

                    var shapes = path.toShapes( true );

                    for ( var j = 0; j < shapes.length; j++ ) {
                        var shape = shapes[ j ];
                        var buttonGeometry = new THREE.ShapeBufferGeometry( shape );

                        var buttonMesh  = new THREE.Mesh( buttonGeometry, buttonMaterial);


                        var scaleMesh = 0.6666;
                        buttonMesh.scale.set(scaleMesh,scaleMesh,scaleMesh);
                        buttonMesh.position.x = 0;
                        buttonMesh.position.y = 85;
                        buttonMesh.material.visible = false;
                        buttonMesh.button = true;
                    }

                }
            });
        });
        resultArray.push(print);
        planeCasters.push(print);
    });
    return resultArray;
}
function AnimateModels(rate) {
    var moveSpeed = 5;
    var moveDistance = 500;
    var AMRotationRate = rate;
    var AMSubjectModel;
    var AMIsRotating = true;
    this.tick = function () {
        if (AMIsRotating){
            scene.children[1].rotation.y += AMRotationRate;

            scene.children[1].children.forEach((element) => {
                this.handlePositions(element);
            });

        } else {
            console.log(AMSubjectModel.parent.rotation.y);
            console.log(scene.children[1].rotation.y);
            this.bringToFront();
        }
    }
    this.bringToFront = function(){

    }
    this.handlePositions = function(object){
        object.children[0].rotation.y += -AMRotationRate;
        if (object.children[0].animating > 0 & object.children[0].position.z < moveDistance){
            object.children[0].position.z += moveSpeed;
        } else if (object.children[0].animating < 0 & object.children[0].position.z > objectRadius) {
            object.children[0].position.z -= moveSpeed;
        }
    }
    this.designateObject = function (object) {
        AMSubjectModel = object;
        planeCasters.forEach((element) => {
            if (object.name == element.name){
                element.animating = 1;
            } else if (element.animating > 0){
                element.animating = -1;
            }
        });
        AMIsRotating = false;
    }
}


// Mouse functions 

function onMouseDown(event){
    var mouse = new THREE.Vector2();
    // update the picking ray with the camera and mouse position
    mouse.x = ( event.offsetX / container.clientWidth ) * 2 - 1;
    mouse.y = - ( event.offsetY / container.clientHeight ) * 2 + 1;

    mouseDown = true;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(planeCasters);
    if (intersects.length > 0){
        // console.log(intersects[0].object);
        animateModels.designateObject(intersects[0].object);
    }
}
function onMouseUp(){
    mouseDown = false;
}
function onMouseMove(){

}
function onMouseOver(){
    mouseOver = true;
}
function onMouseOff(){
    mouseOver = false;
}
function onWindowResize(){
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight)
}

