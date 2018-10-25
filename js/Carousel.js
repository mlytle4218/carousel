/*
	Developed my Marc Lytle 2018
*/
// setting global variables here for control
// For the container the carousel will be in
var container;
var rotationRate = -0.005;
var speed = 0;
var radius = 430;
var cameraDistance = 1000;
var zoomedCameraDistance = 800;
var cameraZoomRate = 10;
var fadeInObject;
var fadeOutObject;
var fadeRate = 0.005;
var casterObjects = [];


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
    container.addEventListener('mousedown', onMouseDown, false);

    container.addEventListener('mouseup', onMouseUp, false);

    container.addEventListener('mousemove', onMouseMove, false);

    container.addEventListener('mouseover', onMouseOver, false);
    container.addEventListener('mouseout', onMouseOff, false);
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
        var geometry = new THREE.PlaneBufferGeometry(radius, radius);

        // combine our image geometry and material into a mesh
        var print = new THREE.Mesh(geometry, material);

        // set the position of the image mesh in the x,y,z dimensions
        print.position.set(0, -3, 0);
        // print.url = element.url;
        // print.name = "print";

        var loader = new THREE.SVGLoader();
        loader.load( element.svg, function ( paths ) {

            var group = new THREE.Group();
            group.scale.multiplyScalar( 0.25 );
            group.position.x = - 70;
            group.position.y = 70;
            group.scale.y *= -1;

            for ( var i = 0; i < paths.length; i ++ ) {

                var path = paths[ i ];

                var material = new THREE.MeshBasicMaterial( {
                    color: path.color,
                    side: THREE.DoubleSide
                } );

                var shapes = path.toShapes( true );

                for ( var j = 0; j < shapes.length; j ++ ) {

                    var shape = shapes[ j ];

                    var geometry = new THREE.ShapeBufferGeometry( shape );
                    var mesh = new THREE.Mesh( geometry, material );
                    mesh.material.opacity =0;

                    group.add( mesh );

                }

            }
            loader.load( element.shop, function ( paths ) {

                // var group = new THREE.Group();
                // group.scale.multiplyScalar( 0.25 );
                // group.position.x = - 70;
                // group.position.y = 70;
                // group.scale.y *= -1;
    
                for ( var i = 0; i < paths.length; i ++ ) {
    
                    var path = paths[ i ];
    
                    var buttonMaterial = new THREE.MeshBasicMaterial( {
                        color: path.color,
                        side: THREE.DoubleSide
                    } );
    
                    var shapes = path.toShapes( true );
    
                    for ( var j = 0; j < shapes.length; j ++ ) {
    
                        var shape = shapes[ j ];
    
                        var buttonGeometry = new THREE.ShapeBufferGeometry( shape );

                        // var buttonGeometry = new THREE.PlaneBufferGeometry(200,100);
                        var buttonMesh = new THREE.Mesh( buttonGeometry, buttonMaterial );
                        mesh.material.opacity =0;
                        var scaleMesh = 0.6666;
                        buttonMesh.scale.set(scaleMesh,scaleMesh,scaleMesh);
                        buttonMesh.position.x = 0;
                        buttonMesh.position.y = 85;
                        buttonMesh.material.opacity = 0;
                        buttonMesh.button = true;
                        buttonMesh.url = element.url;
                        casterObjects.push(buttonMesh);
    
                        group.add( buttonMesh );
    
                    }
    
                }});
            // var buttonMaterial = new THREE.MeshBasicMaterial( {
            //     color: 0xff0000,
            //     side: THREE.DoubleSide
            // } );
            // var buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
            // buttonMesh.position.x = 200;
            // buttonMesh.position.y = 200;
            // buttonMesh.material.opacity = 0;
            // buttonMesh.button = true;
            // buttonMesh.url = element.url;
            // casterObjects.push(buttonMesh);


            // group.add(buttonMesh);

            group.position.set(100, 20, 1);
            // group.name = "svg";
            print.add( group );

        } );



        

        resultArray.push(print);
    });
    return resultArray;
}



function fade() {
    if (imagesArray) {
        imagesArray.forEach(function (element) {
            if (element.children[0]) {
                if (element.children[0].fade) {
                    element.children[0].children.forEach( function (el) {
                        if (el.material.opacity >= 1){
                            el.material.opacity = 0.999;
                        }
                        if (el.material.opacity < 1) {
                            var prog = ((scene.children[1].rotation.y / (Math.PI / 2))) - Math.floor(((scene.children[1].rotation.y / (Math.PI / 2))));
                            if (prog > 0 & prog < 0.5){
                                el.material.opacity =1 - ( prog *2);
                            } else {
                                el.material.opacity = ((prog - 0.5)*2); 
                            }
                        }
                    });
                } else {
                    // if (element.children[0].material.opacity > 0) {
                    //     // element.children[0].material.opacity -= fadeRate;
                    //     var prog = ((scene.children[1].rotation.y / (Math.PI / 2))) - Math.floor(((scene.children[1].rotation.y / (Math.PI / 2))));
                    //     if (prog > 0 & prog < 0.5){
                    //         element.children[0].material.opacity = 1-(prog *2);
                    //     } else {
                    //         element.children[0].material.opacity = ((prog - 0.5)*2);
                    //     }
                    // }

                }
            }
        })
    }
}


function initCar(planesArray) {



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
    // renderer.domElement.style.position = 'absolute'; // required
    // renderer.domElement.style.top = 0;
    // renderer.domElement.style.zIndex = "1"; // required
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
        if (imagesArray[(Math.abs(rotationInRadiansPerUnit) % imagesArray.length)].children[0]) {
            if (imagesArray[(Math.abs(rotationInRadiansPerUnit) % imagesArray.length)].children[0].children[0].material) {
                if (direction < 0) {
                    var negRotationInRadiansPerUnit = Math.round((scene.children[1].rotation.y /    ((Math.PI * 2) / imagesArray.length)    ));
                    imagesArray.forEach(function (element) {
                        element.children[0].fade = false;
                    });
                    imagesArray[(Math.abs(negRotationInRadiansPerUnit) % imagesArray.length)].children[0].fade = true;
                } else {
                    var posRotationInRadiansPerUnit = Math.round((scene.children[1].rotation.y / ((Math.PI * 2) / imagesArray.length) ) + 0.50);
                    imagesArray.forEach(function (element) {
                        element.children[0].fade = false;
                    });
                    imagesArray[inversionArray[(Math.abs(posRotationInRadiansPerUnit) % imagesArray.length)]].children[0].fade = true;
                }
            }
        }
    }
    fade();

    requestAnimationFrame(animateCar);

    renderer.render(scene, camera);

    if (speed < 0.0001 || speed > 0.0001) {
        speed = speed * 0.99;
    }

    if (mouseOver) {
        rotateParent(getRotationRate() / 2);
        if (camera.position.z > zoomedCameraDistance) {
            camera.position.z -= cameraZoomRate;
        }
    } else {
        rotateParent(getRotationRate());
        if (camera.position.z < cameraDistance) {
            camera.position.z += cameraZoomRate;
        }

    }

}

// function to register mouse location on click
function onMouseDown(event) {mouseDown = true;
    averageX = [0, 0];
    averageY = [0, 0];

    event.preventDefault();

    // update the picking ray with the camera and mouse position
    // console.log(mouse);
    mouse.x = ( event.offsetX / container.clientWidth ) * 2 - 1;
    mouse.y = - ( event.offsetY / container.clientHeight ) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    // var intersects = raycaster.intersectObjects(scene.children[0], true);
    var intersects = raycaster.intersectObjects(casterObjects);
    if (intersects.length > 0) {
        inter = intersects[0];
        // console.log(inter.object.url);
        window.location = inter.object.url;
        
    }
    if (inContainer(event)) {
        
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
