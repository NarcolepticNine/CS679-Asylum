// ----------------------------------------------------------------------------
// Initialize Game
// ----------------------------------------------------------------------------
(function initialize() {
	
	var canvas = document.getElementById("canvas"),
        canvasWidth = window.innerWidth,
        canvasHeight = window.innerHeight,
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: canvas,
            clearColor: 0x000000,
            clearAlpha: 1
        }),
        inputData = {},
        game = null;
    
    
    //performance monitor also by Mr. Doob.  Probably should make it togglable. 
    var stats = new Stats();     
    stats.setMode(1); 
    stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
	document.body.appendChild( stats.domElement );
	
    requestFrame = window.requestAnimationFrame
                || window.webkitRequestAnimationFrame
                || window.mozRequestAnimationFrame
                || window.oRequestAnimationFrame
                || window.msRequestAnimationFrame
                || function (callback) { window.setTimeout(callback, 1000 / 60); };

    // Style html a bit
    document.getElementsByTagName("body")[0].style.margin = "0";
    document.getElementsByTagName("body")[0].style.padding = "0";
    document.getElementsByTagName("body")[0].style.overflow = "hidden";

    // Setup sizes and add the renderer to the document 
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    renderer.setSize(canvasWidth, canvasHeight);
    document.getElementById("container").appendChild(renderer.domElement);

    // Create Game object
    game = new Game(renderer, canvas);

    // Setup input handlers and populate input data object
    setupInput(inputData, game);

    // Enter main loop
    (function mainLoop() {
    	stats.begin();
        game.update(inputData);
        game.render(inputData);
        stats.end(); 
        requestFrame(mainLoop);
    })();

    //Deal with resizing
    window.onresize = function (event) {
        game.camera.aspect = window.innerWidth / window.innerHeight;
        game.camera.updateProjectionMatrix();
        var canv = document.getElementById("canvas");
        canv.height = window.innerHeight;
        canv.width = window.innerWidth;
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
})();

// ----------------------------------------------------------------------------
// Setup input handlers and populate input data object
// ----------------------------------------------------------------------------
function setupInput(data, game) {
    // Setup input data structure
    data.viewRay = null;
    data.mouseX = canvas.offsetLeft + canvas.width / 2;
    data.mouseY = canvas.offsetTop + canvas.height / 2;
    data.center = -Math.PI / 2;
    data.theta = Math.PI / 2;
    data.phi = 0;
    data.f = new THREE.Vector3();
    data.v = 0;
    data.hold = 1;
    data.click = 0;
    data.Jump = 0;
    data.trigger = { W: 0, S: 0, A: 0, D: 0, Jump: 0, crouch: 0, run: 0 };

    // Hookup key input
    document.addEventListener("keydown", function (event) {
        if (event.keyCode != 116) {
            event.preventDefault();
        }
        switch (event.keyCode) {
            case 87: data.trigger.W = 1; break;
            case 83: data.trigger.S = 1; break;
            case 65: data.trigger.A = 1; break;
            case 68: data.trigger.D = 1; break;
            case 67: data.trigger.crouch = 1; break;
            case 16: data.trigger.run = 1; break;  
            case 32: data.trigger.Jump = 1; break;
            
        }
    }, false);

    // Hookup key input
    document.addEventListener("keyup", function (event) {
        switch (event.keyCode) {
            case 87: data.trigger.W = 0; break;
            case 83: data.trigger.S = 0; break;
            case 65: data.trigger.A = 0; break;
            case 68: data.trigger.D = 0; break;
            case 67: data.trigger.crouch = 0; break;
            case 16: data.trigger.run = 0; break;  
        }
    }, false);

    document.addEventListener("mousedown", function (event) {
        if (!canvas.pointerLockEnabled) {
            canvas.requestPointerLock();
        }
        data.click = 1;
    }, false);

    document.addEventListener("mouseup", function (event) {
        data.click = 0;
    }, false);

    document.addEventListener("mousemove", function (event) {
        event.preventDefault();
        if (document.pointerLockEnabled) {
            moveLookLocked(event.movementX, event.movementY);
        } else {
            moveLook(event.pageX, event.pageY);
        }
    }, false);

    //when pointerLock can be enabled
    function moveLookLocked(xDelta, yDelta) {
        data.phi += xDelta * 0.0025;
        while (data.phi < 0)
            data.phi += Math.PI * 2;
        while (data.phi >= Math.PI * 2)
            data.phi -= Math.PI * 2;

        data.theta += yDelta * 0.0025;
        if (data.theta < 1e-6) {
            data.theta = 1e-6;
        }
        if (data.theta > Math.PI - 1e-6) {
            data.theta = Math.PI - 1e-6;
        }
    }

    //when pointerLock cannot be enabled
    function moveLook(px, py) {
        data.mouseX = px;
        data.mouseY = py;
        data.theta = (data.mouseY - canvas.offsetTop) / (canvas.height / 2) * Math.PI / 2;
        if (data.theta < 1e-6) {
            data.theta = 1e-6;
        }
        if (data.theta > Math.PI - 1e-6) {
            data.theta = Math.PI - 1e-6;
        }

        data.phi = ((data.mouseX - canvas.offsetLeft) / (canvas.width / 2) - 1) * Math.PI / 2;
        if (data.phi < 0) {
            data.phi += 2 * Math.PI;
        }
        if (data.theta > 2 * Math.PI) {
            data.phi -= 2 * Math.PI;
        }
    }
}