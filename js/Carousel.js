/*
	Developed my Marc Lytle 2018
*/
// setting global variables here for control
// For the container the carousel will be in
var container;
var rotationRate = -0.005;
var speed = 0;
// var radius = 15;
// var cameraDistance = 35;
var radius = 430;
var cameraDistance = 1000;
var zoomedCameraDistance = 800;
var cameraZoomRate = 10;
var fadeInObject;
var fadeOutObject;
var fadeRate = 0.005;


var inter;
var working = 0;

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
var svgsArray;

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

        var loader2 = new THREE.TextureLoader();

        // Load image file into a custom material
        var material2 = new THREE.MeshLambertMaterial({
            // map: loader2.load('pics/make-it-rain-type.png')
            map: loader2.load(element.desc)
        });

        // Allow the transparencies to work
        material2.transparent = true;
        material2.opacity = 0.0;

        // create a plane geometry for the image with a width of 10
        // and a height that preserves the image's aspect ratio
        // var geometry2 = new THREE.PlaneGeometry(radius/2.5, radius/17.5);
        var geometry2 = new THREE.PlaneGeometry(251, 144);

        // combine our image geometry and material into a mesh
        var print2 = new THREE.Mesh(geometry2, material2);

        // set the position of the image mesh in the x,y,z dimensions
        print2.position.set(250, -50, 1);
        print.add(print2);


        // var svgLoader = new THREE.SVGLoader();
        // svgLoader.load(element.svg, function(paths) {
        //     var group = new THREE.Group();
        //     for (var i =0; i < paths.length; i++) {
        //         var path = paths[i];
        //         var material = new THREE.MeshBasicMaterial( {
        //             color: path.color,
        //             side: THREE.DoubleSide,
        //             depthWrite: false
        //         } );
    
        //         var shapes = path.toShapes( true );
    
        //         for ( var j = 0; j < shapes.length; j ++ ) {
    
        //             var shape = shapes[ j ];
        //             var geometry = new THREE.ShapeBufferGeometry( shape );
        //             var mesh = new THREE.Mesh( geometry, material );
        //             group.add( mesh );
    
        //         }
        //     }
        //     print.add(group);
        // });

        // var loader = new THREE.FontLoader();

        // loader.load('fonts/OpenSans-Bold.json', function (font) {


        //     var textGeometry = new THREE.TextGeometry(element.name, {
        //         size: 20,
        //         font: font,
        //         height: 5,
        //         curveSegments: 12,
        //         bevelEnabled: false,
        //         bevelThickness: 10,
        //         bevelSize: 8,
        //         bevelSegments: 5
        //     });
        //     var textMaterial = new THREE.MeshPhongMaterial(
        //         { color: 0x000000, opacity: 0, specular: 0xffffff }
        //     );
        //     textMaterial.transparent = true;
        //     //   textMaterial.opacity.set(1.5);

        //     var mesh = new THREE.Mesh(textGeometry, textMaterial);
        //     mesh.fade = false;
        //     mesh.position.set(100, -20, 0);

        //     print.add(mesh);
        //     // create the plane mesh
        //     // var material = new THREE.MeshBasicMaterial({ wireframe: true });
        //     // var geometry = new THREE.PlaneGeometry(200, 150, 32);
        //     // var planeMesh = new THREE.Mesh(geometry, material);
        //     // planeMesh.position.set(200, -50, 0);
        //     // // add it to the WebGL scene
        //     // print.add(planeMesh);

        //     // var html = [

        //     //     '<div style="width:' + 240 + 'px; height:' + 240 + 'px;">',
        //     //     '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 493.09 71.7"><title>make-it-rain-type</title><path d="M13.39,77H1.29L13.89,5.31h11.6l6.6,31v.11l.1-.21,17.6-30.9h11.7L49,77H36.89l6.8-38.5L48,23.81l-4.1,9.11-13.4,23.2h-3.1L22,33l-.8-9.3L20,38.92Z" transform="translate(-1.29 -5.31)"/><path d="M86.49,66.42H71.29L67.49,77H54.19L82.69,5.31h12.9L99.39,77H86.69Zm-11.1-11.3h10.8l-.5-23.91.8-9.7-2.4,9.7Z" transform="translate(-1.29 -5.31)"/><path d="M129,39l-6.7,9.1-5,28.9h-12.7l12.6-71.71h12.6l-4.4,25.3-.4,1.6,19.3-26.9H159l-19,25.9.3,1.8,7.2,44h-14L129,44.12Z" transform="translate(-1.29 -5.31)"/><path d="M187.09,77h-34.2l12.6-71.71H199L196.89,17h-20.7l-3.1,17.8h18.2l-2.1,11.81H171l-3.2,18.3h21.4Z" transform="translate(-1.29 -5.31)"/><path d="M212.78,77l2.1-12.2h8.4l8.4-47.51h-8.4l2.1-12h29.11l-2.1,12h-8.2l-8.41,47.51h8.31L242,77Z" transform="translate(-1.29 -5.31)"/><path d="M283.38,17.11,272.88,77H260l10.5-59.91h-11.9l2.1-11.8h36.6l-2.1,11.8Z" transform="translate(-1.29 -5.31)"/><path d="M329,49.62,324.18,77h-12.5l12.6-71.71h18.8c13.2,0,18.4,6.8,16.2,19.4L358,32c-1.1,6.61-4.1,10.31-10.5,11.91,5.6,2.1,6.7,6.3,5.5,13l-2.7,14.8c-.4,2.5-.1,4.2,1.2,5.3h-13.6c-1-.8-1-2.9-.6-5.4l2.6-14.6c.9-5-.4-7.4-5.8-7.4Zm5.9-33.31L331,38.22h5.3c6.3,0,8.4-2.3,9.4-7.81l1.1-6.6c1-5.3-1-7.5-6.2-7.5Z" transform="translate(-1.29 -5.31)"/><path d="M386.48,66.42h-15.2L367.48,77h-13.3l28.5-71.71h12.9L399.38,77h-12.7Zm-11.1-11.3h10.8l-.5-23.91.8-9.7-2.4,9.7Z" transform="translate(-1.29 -5.31)"/><path d="M403.78,77l2.1-12.2h8.4l8.4-47.51h-8.4l2.1-12h29.1l-2.1,12h-8.2l-8.4,47.51h8.3L433,77Z" transform="translate(-1.29 -5.31)"/><path d="M452.08,77h-11.8l12.6-71.71h11.5l9.5,41.41,1,7.4,1-10,6.8-38.81h11.7L481.88,77h-11.3l-9.7-41.81-1-8.1-1.1,11.31Z" transform="translate(-1.29 -5.31)"/></svg>',
        //     //     '</div>'
          
        //     //   ].join('\n');
        //     // // var newElement = document.createElement('iframe');
        //     // var newElement = document.createElement('div');
        //     // newElement.innerHTML = html;
        //     // // newElement.src = 'http://learningthreejs.com';
        //     // // newElement.style.width = '1024px';
        //     // // newElement.style.height = '1024px';

        //     // var objectCSS = new THREE.CSS3DObject(newElement);
        //     // // objectCSS.position = planeMesh.position;
        //     // // objectCSS.rotation = planeMesh.rotation;
        //     // svgsArray.push(objectCSS);

        //     // cssScene.add(objectCSS);
        //     // window.objectCSS = objectCSS
        //     // objectCSS.scale.multiplyScalar(1 / 63.5)
        //     // print.add(objectCSS);

        // });

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

function fade() {
    if (imagesArray) {
        imagesArray.forEach(function (element) {
            if (element.children[0]) {
                if (element.children[0].fade) {
                    // console.log(element.children[0].material.opacity);
                    if (element.children[0].material.opacity < 1) {
                        element.children[0].material.opacity += fadeRate;


                    }

                } else {
                    if (element.children[0].material.opacity > 0) {
                        element.children[0].material.opacity -= fadeRate;
                    }

                }
            }
        })
    }
}
function fadeIn(object) {
    // if (object) {
    //     object.children[0].material.opacity += fadeRate;
    //     // console.log(object.children[0].material.opacity);
    // }
    // if (typeof object != 'undefined' & typeof object.children[0].material != 'undefined' & object.children[0].material.opacity < 1){
    //     object.children[0].material.opacity += fadeRate;
    // }  
}

function fadeOut(object) {
    // if (object) {
    //     object.children[0].material.opacity -= fadeRate;
    // }
    // if ( (typeof object != 'undefined') & object.children[0].material & object.children[0].material.opacity > 0){
    //    object.children[0].material.opacity -= fadeRate;
    // }
}

function initCar(planesArray) {



    // setting up the camera - this position just looks a little better to me
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 2000);
    camera.position.set(0, -2, cameraDistance);

    // Set up to track a mouse coordinates
    mouse = new THREE.Vector2();

    // setting the scene
    scene = new THREE.Scene();
    cssScene = new THREE.Scene();

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
        planesArray[i].position.z = 400;
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
    renderer.setClearColor( 0x000000, 0 ); // required
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.position = 'absolute'; // required
    renderer.domElement.style.top = 0;
    renderer.domElement.style.zIndex = "1"; // required
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
    var rotationInRadiansPerUnit = Math.round((scene.children[1].rotation.y / (Math.PI / 2)));
    // console.log(rotationInRadiansPerUnit + ":"+(rotationInRadiansPerUnit % 4));
    // console.log(((scene.children[1].rotation.y / (Math.PI / 2))) - Math.floor(((scene.children[1].rotation.y / (Math.PI / 2)))));
    if ((rotationInRadiansPerUnit % 4) == 0) {
        working = 0;
    }

    working++;

    // ugly ugly ugly inversion to allow for this to work backwards
    var inversionArray = [0, 3, 2, 1];

    var direction = 0;
    if (rotationInRadiansPerUnit <= 0) {
        direction = -1;
    } else {
        direction = 1;
    }
    if (imagesArray) {
        if (imagesArray[(Math.abs(rotationInRadiansPerUnit) % 4)].children[0]) {
            if (imagesArray[(Math.abs(rotationInRadiansPerUnit) % 4)].children[0].material) {
                // imagesArray.forEach(function (element) {
                //     element.children[0].fade = false;
                // });
                // imagesArray[(Math.abs(rotationInRadiansPerUnit) % 4)].children[0].fade = true;
                if (direction < 0) {
                    // imagesArray[(Math.abs(rotationInRadiansPerUnit) % 4)].children[0].material.opacity = 1;
                    var negRotationInRadiansPerUnit = Math.round((scene.children[1].rotation.y / (Math.PI / 2)));




                    imagesArray.forEach(function (element) {
                        element.children[0].fade = false;
                    });
                    imagesArray[(Math.abs(negRotationInRadiansPerUnit) % 4)].children[0].fade = true;




                    // console.log((Math.abs(rotationInRadiansPerUnit) % 4));
                    // console.log(imagesArray[(Math.abs(rotationInRadiansPerUnit) % 4)].children[0].fade);
                    // fadeInObject = imagesArray[(Math.abs(rotationInRadiansPerUnit) % 4)];
                    // if (((Math.abs(rotationInRadiansPerUnit) % 4) + direction) < 0) {
                    //     imagesArray[3].children[0].material.opacity = 0;
                    //     // fadeOutObject = imagesArray[3];
                    // } else {
                    //     imagesArray[(Math.abs(rotationInRadiansPerUnit) % 4) + direction].children[0].material.opacity = 0;
                    //     // fadeOutObject = imagesArray[(Math.abs(rotationInRadiansPerUnit) % 4) + direction];
                    // }

                } else {
                    var posRotationInRadiansPerUnit = Math.round((scene.children[1].rotation.y / (Math.PI / 2)) + 0.50);
                    imagesArray.forEach(function (element) {
                        element.children[0].fade = false;
                    });
                    imagesArray[inversionArray[(Math.abs(posRotationInRadiansPerUnit) % 4)]].children[0].fade = true;
                    // // fadeInObject = imagesArray[ inversionArray[(Math.abs(rotationInRadiansPerUnit) % 4)] ];
                    // if (((Math.abs(rotationInRadiansPerUnit) % 4) - direction) < 0) {
                    //     imagesArray[1].children[0].material.opacity = 0;
                    //     // fadeOutObject = imagesArray[1];
                    // } else {
                    //     imagesArray[inversionArray[(Math.abs(rotationInRadiansPerUnit) % 4) - direction]].children[0].material.opacity = 0;
                    //     // fadeOutObject = imagesArray[inversionArray[(Math.abs(rotationInRadiansPerUnit) % 4) - direction]];
                    // }
                }
            }
        }
    }
    fadeIn(fadeInObject);
    fadeOut(fadeOutObject);
    fade();

    requestAnimationFrame(animateCar);

    renderer.render(scene, camera);

    // document.body.appendChild(cssRenderer.domElement);
    // cssRenderer.domElement.appendChild(renderer.domElement);

    if (speed < 0.0001 || speed > 0.0001) {
        speed = speed * 0.99;
    }

    if (mouseOver) {
        rotateParent(getRotationRate() / 2);
        // rotateCSSParent(getRotationRate() /2);
        if (camera.position.z > zoomedCameraDistance) {
            camera.position.z -= cameraZoomRate;
        }
    } else {
        rotateParent(getRotationRate());
        // rotateCSSParent(getRotationRate());
        if (camera.position.z < cameraDistance) {
            camera.position.z += cameraZoomRate;
        }

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
