// configuration variables
var radius = 430;
var objectRadius = 400;
var cameraDistance = 1000;
var rotationRate = -0.005;
var ambientLightColor = 0xffffff;
var initialRelativePosition = new THREE.Vector3(0,-3,400);
var presentationPosition = new THREE.Vector3(0,50,650);


// global models
var renderer;
var scene;
var camera;
var container;
var mouseOver;
var mouseDown;
var animateModels;
var planeCasters = [];
var buttonCasters = [];

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
    parent.rotation.y -= (10*Math.PI);
    scene.add(parent);

    var progress = 0;
    for (var i = 0; i < planesArray.length; i++) {
        var pivot = new THREE.Object3D();
        pivot.rotation.y = progress * Math.PI / planesArray.length;
        parent.add(pivot);
        // planesArray[i].position.z = objectRadius;
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
    requestAnimationFrame(animateCarousel);
    animateModels.tick();
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

        // print.position.set(0.-3,0);
        print.position.copy(initialRelativePosition);
        print.animating = -1;
        print.name = element.pic;

        var svgLoader = new THREE.SVGLoader();
        svgLoader.load( element.svg, function(paths) {
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
                    // svgMesh.material.visible = false;

                    group.add( svgMesh );

                    // svgMesh.scale.multiplyScalar( 0.25 );
                    // svgMesh.position.x = 120;
                    // svgMesh.position.y = 0;
                    // svgMesh.scale.y *= -1;
                    // print.add(svgMesh);

                }
            }

            svgLoader.load( element.shop, function ( paths ){
                var wholeButton = new THREE.Group();
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


                        var scaleMesh = 0.2;
                        // buttonMesh.scale.set(scaleMesh,scaleMesh,scaleMesh);
                        // buttonMesh.position.x = 120;
                        buttonMesh.position.y = 80;
                        // buttonMesh.scale.y *= -1;
                        // buttonMesh.material.visible = false;
                        buttonMesh.button = true;
                        buttonCasters.push(buttonMesh);
                        group.add(buttonMesh);
                        // group.visible = false;
                        // group.position.x = -500;
                    }

                }
            });
            group.position.x = 2100;
            group.position.y = 20;
            print.add(group);
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
    var targetRotationPosition = 0;
    var targetRotationTotalDistance;
    var bringToFrontWorking = false;
    var ModelInitialPosition = new THREE.Vector3();
    var choiceNotMade = true;
    var AMAnimateSVG = false;
    var AMOffSet = -0.05;
    this.tick = function () {
        if (AMIsRotating){
            this.rotate(1);
            this.extendZ();
            if (AMSubjectModel){
                this.hideSVG();

            }
        } else if(bringToFrontWorking) { 
            this.bringToFront();
        } else if (AMAnimateSVG){
            this.showSVG();
        }
    }
    this.showSVG = function() {
        if (AMSubjectModel.children[0].position.x > 150){
            AMSubjectModel.children[0].position.x -= 70;

        }
    }
    this.hideSVG = function() {
        if (AMSubjectModel.children[0].position.x < 500){
            AMSubjectModel.children[0].position.x += 100;
        } else if (AMSubjectModel.children[0].position.x < 2100){
            AMSubjectModel.children[0].position.x = 2100;
        }
    }
    this.bringToFront = function(){
        if (AMSubjectModel){
            // var currentParPos = AMSubjectModel.parent.parent.rotation.y + 0.05;
            // var objPos = (currentParPos + AMSubjectModel.parent.rotation.y);
            
            if (Math.abs(targetRotationPosition-AMSubjectModel.parent.parent.rotation.y)>0.01){
                if (targetRotationPosition>AMSubjectModel.parent.parent.rotation.y){
                    this.extendZwithPercent(1-(targetRotationPosition-AMSubjectModel.parent.parent.rotation.y)/targetRotationTotalDistance);
                    this.rotate(-4);
                } else {
                    this.extendZwithPercent(1-(targetRotationPosition-AMSubjectModel.parent.parent.rotation.y)/targetRotationTotalDistance);
                    this.rotate(4);
                }
            }else {

                bringToFrontWorking = false;
                AMSubjectModel.children[0].position.x = 300;
                AMAnimateSVG = true;
            }
        }
    }
    this.extendZ = function(){

        scene.children[1].children.forEach(function(element) {
            if (element.children[0].animating == 1 & element.children[0].position.z < presentationPosition.z){
                element.children[0].position.z +=2;
            } else if (element.children[0].animating == -1 & element.children[0].position.z > initialRelativePosition.z) {
                element.children[0].position.z -= 2;
            }


            if (element.children[0].animating == 1 & element.children[0].position.y < presentationPosition.y){
                element.children[0].position.y +=0.35;
            } else if (element.children[0].animating == -1 & element.children[0].position.y > initialRelativePosition.y){
                element.children[0].position.y -=0.35;
            }
        });
    }
    this.extendZwithPercent = function(percent){
        scene.children[1].children.forEach(function(element) {
            if (element.children[0].animating == 1 & element.children[0].position.z < presentationPosition.z){
                element.children[0].position.z = ((presentationPosition.z - ModelInitialPosition.z) * (percent)) + ModelInitialPosition.z ;
                element.children[0].position.y = ((presentationPosition.y - ModelInitialPosition.y) * (percent)) + ModelInitialPosition.y ;
            } else if (element.children[0].animating == -1 & element.children[0].position.z > initialRelativePosition.z) {
                element.children[0].position.z -= 2;
            }


            if (element.children[0].animating == -1 & element.children[0].position.y > initialRelativePosition.y){
                element.children[0].position.y -=0.35;
            }
        });
    }
    this.rotate = function(speed){
        scene.children[1].rotation.y += AMRotationRate * speed;

        scene.children[1].children.forEach(function(element) {

            element.children[0].rotation.y += -AMRotationRate * speed;
        });
    }
    this.designateObject = function (object) {
        if (choiceNotMade){
            AMSubjectModel = object;
            var relativeRotation = (AMSubjectModel.parent.parent.rotation.y + AMSubjectModel.parent.rotation.y)%(2*Math.PI);
            if (  Math.abs(relativeRotation)      > Math.PI){
                targetRotationPosition = AMSubjectModel.parent.parent.rotation.y +AMOffSet  - (Math.PI-(Math.abs(relativeRotation)-Math.PI));
                targetRotationTotalDistance = targetRotationPosition - AMSubjectModel.parent.parent.rotation.y;
            } else {
                targetRotationPosition = AMSubjectModel.parent.parent.rotation.y + AMOffSet +Math.abs(relativeRotation);
                targetRotationTotalDistance = targetRotationPosition - AMSubjectModel.parent.parent.rotation.y;
            }
            ModelInitialPosition.copy(object.position);

            planeCasters.forEach(function(element) {
                if (object.name == element.name){
                    element.animating = 1;
                }
            });
            AMIsRotating = false;
            bringToFrontWorking = true;
            choiceNotMade = false;
        }
    }
    this.deselectObject = function(object) {
        planeCasters.forEach(function(element){
            element.animating = -1;
        });
        AMIsRotating = true;
        choiceNotMade = true;
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
    var intersectsButtons = raycaster.intersectObjects(buttonCasters);
    if (intersectsButtons.length > 0){
        // console.log(intersectsButtons);
        animateModels.deselectObject(intersectsButtons[0].object);
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

