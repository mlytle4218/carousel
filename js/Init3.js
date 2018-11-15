// configuration variables
var radius = 430;
var objectRadius = 400;
var cameraDistance = 1000;
var rotationRate = -0.01;
var ambientLightColor = 0xffffff;
var initialRelativePosition = new THREE.Vector3(0, -3, 400);
var presentationPosition = new THREE.Vector3(0, 50, 650);


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

function start(fileArray) {
    var imagesArray = createImagePlanes(fileArray);

    container = document.getElementById(connectingElement);

    container.addEventListener('mousedown', onMouseDown, false);
    container.addEventListener('mouseup', onMouseUp, false);
    container.addEventListener('mouseover', onMouseOver, false);
    container.addEventListener('mouseout', onMouseOff, false);
    window.addEventListener('resize', onWindowResize, false);

    initCarousel(imagesArray);
}

function initCarousel(planesArray) {

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
    parent.rotation.y -= (10 * Math.PI);
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
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.gammaOutput = true;
    container.appendChild(renderer.domElement);


    animateModels = new AnimateModels(rotationRate);

    animateCarousel();
}

function animateCarousel() {
    requestAnimationFrame(animateCarousel);
    animateModels.tick();
    renderer.render(scene, camera);
}



function getPixel(image, x, y, width, height) {
    var xMod = Math.floor(x * width);
    var yMod = Math.floor((1 - y) * height);

    var imageCanvas = document.createElement('canvas');
    imageCanvas.width = image.width;
    imageCanvas.height = image.height;
    var context = imageCanvas.getContext('2d');
    context.drawImage(image, 0, 0);
    var imagedata = context.getImageData(0, 0, image.width, image.height);
    var position = (xMod + imagedata.width * yMod) * 4;
    var data = imagedata.data;
    return data[position + 3];
}

function createImagePlanes(input) {
    var resultArray = [];
    input.files.forEach(function (element, it) {
        var textureLoader = new THREE.TextureLoader();

        var printMaterial = new THREE.MeshLambertMaterial({
            map: textureLoader.load(element.pic)
        });

        printMaterial.transparent = true;

        var printGeometry = new THREE.PlaneBufferGeometry(radius, radius);

        // The shoe print to which the other objects will adhere
        var print = new THREE.Mesh(printGeometry, printMaterial);

        // print.position.set(0.-3,0);
        print.position.copy(initialRelativePosition);
        print.animating = -1;
        print.name = element.pic;

        var svgLoader = new THREE.SVGLoader();
        svgLoader.load(element.svg, function (paths) {
            var group = new THREE.Group();
            group.scale.multiplyScalar(0.25);
            group.position.x = - 70;
            group.position.y = 70;
            group.scale.y *= -1;

            for (var i = 0; i < paths.length; i++) {
                var path = paths[i];

                var svgMaterial = new THREE.MeshBasicMaterial({
                    color: path.color,
                    side: THREE.DoubleSide
                });

                var shapes = path.toShapes(true);
                for (var j = 0; j < shapes.length; j++) {
                    var shape = shapes[j];
                    var svgGeometry = new THREE.ShapeBufferGeometry(shape);
                    var svgMesh = new THREE.Mesh(svgGeometry, svgMaterial);
                    group.add(svgMesh);
                }
            }

            svgLoader.load(element.shop, function (paths) {
                for (var i = 0; i < paths.length; i++) {
                    var path = paths[i];

                    var buttonMaterial = new THREE.MeshBasicMaterial({
                        color: path.color,
                        side: THREE.DoubleSide
                    });

                    var shapes = path.toShapes(true);

                    for (var j = 0; j < shapes.length; j++) {
                        var shape = shapes[j];
                        var buttonGeometry = new THREE.ShapeBufferGeometry(shape);
                        var buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
                        buttonMesh.position.y = 80;
                        buttonMesh.button = true;
                        buttonCasters.push(buttonMesh);
                        group.add(buttonMesh);
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

    var animationSpeedObject = 40;
    this.tick = function () {
        if (AMIsRotating) {
            this.rotate(1);
            this.extendZ();
            if (AMSubjectModel) {
                this.hideSVG();

            }
        } else if (bringToFrontWorking) {
            this.bringToFront();
        } else if (AMAnimateSVG) {
            this.showSVG();
        }
    }
    this.showSVG = function () {
        if (AMSubjectModel.children[0].position.x > 150) {
            AMSubjectModel.children[0].position.x -= 70;

        }
    }
    this.hideSVG = function () {
        if (AMSubjectModel.children[0].position.x < 500) {
            AMSubjectModel.children[0].position.x += 150;
        } else if (AMSubjectModel.children[0].position.x < 2100) {
            AMSubjectModel.children[0].position.x = 2100;
        }
    }
    this.bringToFront = function () {
        if (AMSubjectModel) {
            this.transform();
            // if (Math.abs(targetRotationPosition - AMSubjectModel.parent.parent.rotation.y) > 0.01) {
            //     if (targetRotationPosition > AMSubjectModel.parent.parent.rotation.y) {
            //         this.extendZwithPercent(1 - (targetRotationPosition - AMSubjectModel.parent.parent.rotation.y) / targetRotationTotalDistance);
            //         this.rotate(-4);
            //     } else {
            //         this.extendZwithPercent(1 - (targetRotationPosition - AMSubjectModel.parent.parent.rotation.y) / targetRotationTotalDistance);
            //         this.rotate(4);
            //     }
            // } else {

            //     bringToFrontWorking = false;
            //     AMSubjectModel.children[0].position.x = 300;
            //     AMAnimateSVG = true;
            // }
        }
    }


    this.transform = function() {
        if (AMSubjectModel.progress < animationSpeedObject){
            scene.children[1].rotation.y += AMSubjectModel.targetRotationIncrement;

            scene.children[1].children.forEach(function (element) {
    
                element.children[0].rotation.y += -AMSubjectModel.targetRotationIncrement;
            });
            AMSubjectModel.position.z += AMSubjectModel.ZPositionIncrement;
            AMSubjectModel.position.y += AMSubjectModel.YPositionIncrement;

            AMSubjectModel.progress++;
        } else {
            bringToFrontWorking = false;
            AMSubjectModel.children[0].position.x = 300;
            AMAnimateSVG = true;
        }
    }
    this.rotate = function (speed) {
        scene.children[1].rotation.y += AMRotationRate * speed;

        scene.children[1].children.forEach(function (element) {

            element.children[0].rotation.y += -AMRotationRate * speed;
        });
    }
    this.extendZ = function () {

        scene.children[1].children.forEach(function (element) {
            // if (element.children[0].animating == 1 & element.children[0].position.z < presentationPosition.z) {
            //     element.children[0].position.z += 2;
            // } else 
            if (element.children[0].animating == -1 & element.children[0].position.z > initialRelativePosition.z) {
                element.children[0].position.z -= element.children[0].ZPositionIncrement;
            }


            // if (element.children[0].animating == 1 & element.children[0].position.y < presentationPosition.y) {
            //     element.children[0].position.y += 0.35;
            // } else 
            if (element.children[0].animating == -1 & element.children[0].position.y > initialRelativePosition.y) {
                element.children[0].position.y -= element.children[0].YPositionIncrement;
            }
        });
    }
    this.extendZwithPercent = function (percent) {
        scene.children[1].children.forEach(function (element) {
            if (element.children[0].animating == 1 & element.children[0].position.z < presentationPosition.z) {
                element.children[0].position.z = ((presentationPosition.z - ModelInitialPosition.z) * (percent)) + ModelInitialPosition.z;
                element.children[0].position.y = ((presentationPosition.y - ModelInitialPosition.y) * (percent)) + ModelInitialPosition.y;
            } else if (element.children[0].animating == -1 & element.children[0].position.z > initialRelativePosition.z) {
                element.children[0].position.z -= 2;
            }


            if (element.children[0].animating == -1 & element.children[0].position.y > initialRelativePosition.y) {
                element.children[0].position.y -= 0.35;
            }
        });
    }
    this.designateObject = function (object) {
        if (choiceNotMade) {
            AMSubjectModel = object;
            // adding this to track the model's progress from inline to center position
            AMSubjectModel.progress = 0;
            var relativeRotation = (AMSubjectModel.parent.parent.rotation.y + AMSubjectModel.parent.rotation.y) % (2 * Math.PI);
            if (Math.abs(relativeRotation) > Math.PI) {
                targetRotationPosition = AMSubjectModel.parent.parent.rotation.y + AMOffSet - (Math.PI - (Math.abs(relativeRotation) - Math.PI));
                targetRotationTotalDistance = targetRotationPosition - AMSubjectModel.parent.parent.rotation.y;
                // this designates the incremental disatances each tick will call
                AMSubjectModel.targetRotationIncrement = targetRotationTotalDistance / animationSpeedObject;
            } else {
                targetRotationPosition = AMSubjectModel.parent.parent.rotation.y + AMOffSet + Math.abs(relativeRotation);
                targetRotationTotalDistance = targetRotationPosition - AMSubjectModel.parent.parent.rotation.y;
                // this designates the incremental disatances each tick will call
                AMSubjectModel.targetRotationIncrement = targetRotationTotalDistance / animationSpeedObject;
            }
            ModelInitialPosition.copy(object.position);

            AMSubjectModel.ZPositionIncrement = (presentationPosition.z - object.position.z)/animationSpeedObject;
            AMSubjectModel.YPositionIncrement = (presentationPosition.y - object.position.y)/animationSpeedObject;



            planeCasters.forEach(function (element) {
                if (object.name == element.name) {
                    element.animating = 1;
                }
            });
            AMIsRotating = false;
            bringToFrontWorking = true;
            choiceNotMade = false;
        }
    }
    this.deselectObject = function (object) {
        planeCasters.forEach(function (element) {
            element.animating = -1;
        });
        AMIsRotating = true;
        choiceNotMade = true;
    }
}


// Mouse functions 

function onMouseDown(event) {
    var mouse = new THREE.Vector2();
    // update the picking ray with the camera and mouse position
    mouse.x = (event.offsetX / container.clientWidth) * 2 - 1;
    mouse.y = - (event.offsetY / container.clientHeight) * 2 + 1;

    mouseDown = true;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(planeCasters);
    for (let element of intersects) {
        if (getPixel(
            element.object.material.map.image,
            element.uv.x,
            element.uv.y,
            element.object.material.map.image.width,
            element.object.material.map.image.height
        ) == 255) {
            animateModels.designateObject(element.object);
            break;
        }
    }

    var intersectsButtons = raycaster.intersectObjects(buttonCasters);
    if (intersectsButtons.length > 0) {
        animateModels.deselectObject(intersectsButtons[0].object);
    }
}
function onMouseUp() {
    mouseDown = false;
}
function onMouseOver() {
    mouseOver = true;
}
function onMouseOff() {
    mouseOver = false;
}
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight)
}

