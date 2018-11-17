// configuration variables
var radius = 430;
var objectRadius = 400;
var cameraDistance = 1000;
var rotationRate = -0.01;
var ambientLightColor = 0xffffff;
var initialRelativePosition = new THREE.Vector3(0, -3, 400);
var presentationPosition = new THREE.Vector3(0, 50, 650);


// global models
var renderer, renderer2;
var scene;
var camera;
var container;
var mouseOver;
var mouseDown;
var animateModels;
var planeCasters = [];
var buttonCasters = [];
var newButtonCasters = [];
var ctx;

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

        //CSS3D Scene
    scene2 = new THREE.Scene();

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

    // console.log(scene.children[1].children);

    scene.children[1].children.forEach( function(el){
        // console.log(el.children[0].div);
        // console.log("printing");
        scene2.add(el.children[0].div);
    });



        // //HTML
        // element = document.createElement('div');
        // element.innerHTML = 'Plain text inside a div.';
        // element.className = 'animated bounceInDown' ; 
        // element.style.background = "#0094ff";
        // element.style.fontSize = "2em";
        // element.style.color = "white";
        // element.style.padding = "2em";

        // //CSS Object
        // div = new THREE.CSS3DObject(element);
        // div.position.x = 8;
        // div.position.y = 9;
        // div.position.z = 15;
        // scene2.add(div);


    //CSS3D Renderer
    renderer2 = new THREE.CSS3DRenderer();
    renderer2.setSize(container.clientWidth, container.clientHeight);
    renderer2.domElement.style.position = 'absolute';
    renderer2.domElement.style.top = 0;
    container.appendChild(renderer2.domElement);


    animateModels = new AnimateModels(rotationRate);
    // changeCanvas();
    // scene.children[1].children.forEach(function(element){
    //     var helper = element.children[0].children[0].material.map.image;
    //     console.log(helper);
    // });




    animateCarousel();
}

function animateCarousel() {
    requestAnimationFrame(animateCarousel);
    animateModels.tick();
    renderer.render(scene, camera);
    renderer2.render(scene2, camera);
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

function changeCanvas() {

    // ctx.font = '20pt Arial';
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
    ctx.fillStyle = 'black';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(new Date().getTime(), canvas.width / 2, canvas.height / 2);
    var can = new THREE.Texture(canvas);
    // console.log(can);

    scene.children[1].children[0].children[0].children[0].material.map = can;

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
        print.name = element.name;       
        //HTML
        var conElm =  document.createElement('div');
        conElm.className = 'panelOut';


        var els = document.createElement('div');
        els.innerHTML = element.name.toUpperCase();
        els.className = 'panel unloaded ' ; 
        els.addEventListener('click',function(){
            animateModels.deselectObject(print);
        }); 
        var para1 = document.createElement('p');
        para1.innerHTML = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sit amet pretium dui. Proin ut commodo ligula. Proin ipsum sapien, sollicitudin nec ante at, tempor faucibus neque. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.';// Quisque sit amet pharetra turpis, non consectetur justo. Donec in augue a diam pretium vulputate. Fusce sodales velit vel sem pellentesque, sit amet facilisis orci accumsan. Ut commodo porta nulla, et placerat dui suscipit ac';
        // var para2 = document.createElement('p');
        // para2.innerHTML = 'Duis et rhoncus turpis, nec pellentesque erat. Suspendisse sollicitudin leo et ultrices accumsan. Phasellus porttitor interdum nisi, eu pulvinar nulla egestas in. Cras quis bibendum ante. Quisque varius, arcu ut tincidunt pellentesque, sapien tellus consequat urna, non iaculis ante erat ut nisl. Aliquam pharetra volutpat dolor, vitae condimentum quam cursus sed. Vivamus purus orci, ullamcorper vel viverra vitae, tempor sit amet nisl. Quisque pellentesque porttitor ligula id imperdiet. Fusce vel dignissim metus, eu varius est. Cras sagittis dolor justo. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In dictum imperdiet turpis, sed condimentum nunc ornare consequat. Aenean vitae arcu lectus. Nam ac semper ex.';

        conElm.appendChild(els);
        conElm.appendChild(para1);
        // conElm.appendChild(para2);
        // els.style.background = "#0094ff";
        // els.style.fontSize = "2em";
        // els.style.color = "white";
        // els.style.padding = "2em";

        //CSS Object
        div = new THREE.CSS3DObject(conElm);
        div.position.x = 1300;
        div.position.y = 150;
        div.position.z = 0;

        // console.log(div.element.clientHeight);

        print.div = div;
          


 
        // print.add(shoePanelMesh);

        // canvas = document.getElementById('test');
        // ctx = canvas.getContext('2d');
        // labelTexture = new THREE.Texture(canvas);

        // var shoePanel = new THREE.PlaneGeometry(150,150,1,1);
        // var shoePanelMaterial = new THREE.MeshBasicMaterial( {
        //     // color: 0xffff00, 
        //     side: THREE.DoubleSide,
        //     // transparent: true,
        //     // depthTest: false,
        //     // depthWrite: false,
        //     // blending: THREE.AdditiveBlending,
        //     // map: labelTexture
        //     map: textureLoader.load('pics/veteransDay.png')
        // } );
        // // var shoePanelMaterial = new THREE.MeshBasicMaterial({
        // //     color: 0x0000ff,
        //     // map: labelTexture,
        // //     transparent: false,
        // //     side: THREE.DoubleSide,
        // //     depthTest:false,
        // //     depthWrite: false,
        // //     blending: THREE.AdditiveBlending
        // // });
        // shoePanelMesh = new THREE.Mesh(shoePanel, shoePanelMaterial);
        // shoePanelMesh.position.x = 200;
        // shoePanelMesh.position.y = -50;

        // ctx.clearRect(0, 0, 350, 350);
        
        // ctx.fillStyle="#FF0000";
        // ctx.fillRect(20,20,150,100);

        // //small text
        // // ctx.textBaseline = 'top';
        // // ctx.fillStyle = '#000000';
        // // ctx.font = '400 90px Roboto';
        // // ctx.backgroundColorStyle = "#FF0000";
        // // // ctx.fillText( element.name, 140, 220);

        // // //big number
        // // var fontSize = '600px';
        // // var topPos = 220;
        // // ctx.font = '500 ' + fontSize + ' Roboto';		
        // // ctx.fillText( element.name, 65, 0);
        // print.add(shoePanelMesh);








        // var svgLoader = new THREE.SVGLoader();
        // svgLoader.load(element.svg, function (paths) {
        //     var group = new THREE.Group();
        //     group.scale.multiplyScalar(0.25);
        //     group.position.x = - 70;
        //     group.position.y = 70;
        //     group.scale.y *= -1;

        //     for (var i = 0; i < paths.length; i++) {
        //         var path = paths[i];

        //         var svgMaterial = new THREE.MeshBasicMaterial({
        //             color: path.color,
        //             side: THREE.DoubleSide
        //         });

        //         var shapes = path.toShapes(true);
        //         for (var j = 0; j < shapes.length; j++) {
        //             var shape = shapes[j];
        //             var svgGeometry = new THREE.ShapeBufferGeometry(shape);
        //             var svgMesh = new THREE.Mesh(svgGeometry, svgMaterial);
        //             group.add(svgMesh);
        //         }
        //     }

        //     svgLoader.load(element.shop, function (paths) {
        //         for (var i = 0; i < paths.length; i++) {
        //             var path = paths[i];

        //             var buttonMaterial = new THREE.MeshBasicMaterial({
        //                 color: path.color,
        //                 side: THREE.DoubleSide
        //             });

        //             var shapes = path.toShapes(true);

        //             for (var j = 0; j < shapes.length; j++) {
        //                 var shape = shapes[j];
        //                 var buttonGeometry = new THREE.ShapeBufferGeometry(shape);
        //                 var buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
        //                 buttonMesh.position.y = 80;
        //                 buttonMesh.button = true;
        //                 buttonCasters.push(buttonMesh);
        //                 group.add(buttonMesh);
        //             }

        //         }
        //     });
        //     group.position.x = 2100;
        //     group.position.y = 20;
        //     print.add(group);
        // });
        resultArray.push(print);
        planeCasters.push(print);
    });
    return resultArray;
}

function clickCheat(object){
    // console.log(object);
    animateModels.deselectObject(object);
}

function createInfoPanel(object){
    // console.log(object.children[0]);
    if (!object.children[0]){

        //HTML
        element = document.createElement('div');
        element.innerHTML = 'Plain text inside a div.';
        element.className = 'animated bounceInDown' ; 
        element.style.background = "#0094ff";
        element.style.fontSize = "2em";
        element.style.color = "white";
        element.style.padding = "2em";

        //CSS Object
        div = new THREE.CSS3DObject(element);
        div.position.x = 8;
        div.position.y = 9;
        div.position.z = 15;

        return div;
        // scene2.add(div);
        // canvas = document.createElement('canvas');
        // canvas.setAttribute("class","panel");
        // canvas.width = 512;
        // canvas.height = 256;

        // elements =[];
        // var shopNow = {
        //     x: 15,
        //     y: 50,
        //     width: 150,
        //     height: 50
        // };
        // elements.push(shopNow);


    
        // // canvas = document.getElementById('test');
        // ctx = canvas.getContext('2d');
        // ctx.font = '30pt myfont';
        // ctx.fillStyle = "rgba(0,0,0,.1)";
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
        // // ctx.fillStyle = 'white';
        // // ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
        // ctx.fillStyle = 'black';
        // ctx.textAlign = "left";
        // ctx.textBaseline = "middle";
        // ctx.fillText(object.name.toUpperCase(), 15, 30);



        // roundRect(ctx, shopNow.x, shopNow.y, shopNow.width, shopNow.height, 10, true, false);
        // labelTexture = new THREE.Texture(canvas);
        // labelTexture.needsUpdate = true;
    
        // var textureLoader = new THREE.TextureLoader();
    
        // var shoePanel = new THREE.PlaneGeometry(300,150,1,1);
        // var shoePanelMaterial = new THREE.MeshBasicMaterial( {
        //     side: THREE.DoubleSide,
        //     map: labelTexture,
        //     // map: textureLoader.load('pics/veteransDay.png'),
        //     transparent: true,
        //     depthTest: false,
        //     depthWrite: false,
        //     // blending: THREE.AdditiveBlending,
        // } );
        // shoePanelMesh = new THREE.Mesh(shoePanel, shoePanelMaterial);
        // newButtonCasters.push(shoePanelMesh);
        // shoePanelMesh.position.x = 600;
        // shoePanelMesh.position.y = -50;
        // shoePanelMesh.elements = elements;

        // return shoePanelMesh;
    } else {
        return null;
    }
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
        // console.log(AMSubjectModel.div.element.clientHeight);
        AMSubjectModel.div.position.y = 200 - AMSubjectModel.div.element.clientHeight/2;
        var endPoint = 225;
        if (AMSubjectModel.div.position.x > endPoint + AMSubjectModel.div.element.clientWidth/2){
            if (AMSubjectModel.div.position.x > endPoint + AMSubjectModel.div.element.clientWidth/2 + 200){
                AMSubjectModel.div.position.x -= 200;
            } else {
                AMSubjectModel.div.position.x -= 50;
            }
        }
        // if (AMSubjectModel.children[0].position.x > endPoint) {
        //     if (AMSubjectModel.children[0].position.x > endPoint + 50){
        //         AMSubjectModel.children[0].position.x -= 50;
        //     } else {
        //         AMSubjectModel.children[0].position.x -= 25;
        //     }

        // }
    }
    this.hideSVG = function () {
        if (AMSubjectModel.div.position.x < 1200){
            AMSubjectModel.div.position.x += 150;
        } 
        // if (AMSubjectModel.children[0].position.x < 500) {
        //     AMSubjectModel.children[0].position.x += 150;
        // } else if (AMSubjectModel.children[0].position.x < 2100) {
        //     AMSubjectModel.children[0].position.x = 2100;
        // }
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
            // AMSubjectModel.children[0].position.x = 300;
            AMAnimateSVG = true;

            //******************************************************************************* */
            // var result = createInfoPanel(AMSubjectModel);
            // console.log(result.getWorldPosition());
            // if (result === null ){
            //     // console.log("drat! was null");
            //     AMSubjectModel.children[0].position.x = 300;
            //     AMAnimateSVG = true;
            // } else {
            //     // result.position.x = 500;
            //     AMAnimateSVG = true;
            //     AMSubjectModel.add(result);
            //     scene2.add(result);
            // }
            // AMSubjectModel.add(createInfoPanel(AMSubjectModel)) ;
            /************************************************************************************ */
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
                // this designates the incremental distances each tick will call
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
        // scene.remove(object);
        // object.material.dispose();
        // object.geometry.dispose();
        // console.log(object);
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
            // console.log(element.object);
            break;
        }
    }

    var intersectsButtons = raycaster.intersectObjects(buttonCasters);
    if (intersectsButtons.length > 0) {
        animateModels.deselectObject(intersectsButtons[0].object);
        console.log(intersectsButtons[0]);
    }

    var intersectsButtonsNew = raycaster.intersectObjects(newButtonCasters);
    if (intersectsButtonsNew.length>0){
        // animateModels.deselectObject(intersectsButtonsNew[0].object);
        // console.log(intersectsButtonsNew[0].endPoint);
        // console.log(mouse);
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
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer2.setSize(container.clientWidth, container.clientHeight);
}


/* 'Borrowed' in it's entirety from 
https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas */
/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object 
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == 'undefined') {
      stroke = true;
    }
    if (typeof radius === 'undefined') {
      radius = 5;
    }
    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
      var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
  
  }
