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
        game = null,
        debug = false;

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

    if (debug) {

        var stats = new Stats();
        stats.setMode(0);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.body.appendChild(stats.domElement);

        var info = document.createElement('div');
        info.style.position = 'absolute';
        info.style.color = "#ffffff";
        info.style.top = '50px';
        info.style.left = '5px';
        info.style.width = '100%';
        info.style.textAlign = 'left';
        info.innerHTML = '';
        document.body.appendChild(info);
    }


    // Create Game object
    game = new Game(renderer, canvas);

    // Setup input handlers and populate input data object
    setupInput(inputData, game);

    // Enter main loop
    (function mainLoop() {
        setTimeout(function () {
            if (debug) stats.begin();

            if (game.update(inputData)) {
                game.render(inputData);


                if (debug) {
                    updateDebug(info, game);
                    stats.end()
                };

            }

            requestFrame(mainLoop);
        }, 1000 / 35);

    })();

    //Deal with resizing
    window.onresize = function (event) {
        if (game.camera != null) {
            game.camera.aspect = window.innerWidth / window.innerHeight;
            game.camera.updateProjectionMatrix();
        }
        var canv = document.getElementById("canvas");
        canv.height = window.innerHeight;
        canv.width = window.innerWidth;
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
})();

function updateDebug(info, game) {

    if (game != null) {

        player = game.player;
        warden = game.warden;
        info.innerHTML = "Player x: " + player.mesh.position.x.toFixed(2);
        info.innerHTML += " y: " + player.mesh.position.y.toFixed(2);
        info.innerHTML += " z: " + player.mesh.position.z.toFixed(2);
        info.innerHTML += " Light: " + player.lightOn;
        info.innerHTML += " Current Speed: " + player.currSpd + "<br / >";

        info.innerHTML += " Sound Level: " + player.sound
        info.innerHTML += " Key: " + game.key + "<br / ><br />";

        if (warden.mesh) {
            info.innerHTML += "Warden x: " + warden.mesh.position.x.toFixed(2);
            info.innerHTML += " y: " + warden.mesh.position.y.toFixed(2);
            info.innerHTML += " z: " + warden.mesh.position.z.toFixed(2);
            info.innerHTML += " vX: " + warden.vX.toFixed(2) + " vZ: " + warden.vZ.toFixed(2) + "<br />";

            info.innerHTML += "Path Length: " + warden.Path.length + "<br />";
            if (warden.pathPt) {
                info.innerHTML += " Next path pt x: " + warden.pathPt.x;
                info.innerHTML += " y: " + warden.pathPt.y;
                info.innerHTML += " z: " + warden.pathPt.z + "<br />";
            }

            if (warden.currPatrol) {
                info.innerHTML += " Current Patrol X: " + warden.currPatrol.x;
                info.innerHTML += " Y: " + warden.currPatrol.y;
                info.innerHTML += " Z: " + warden.currPatrol.z + "<br />";
            }
        }


        info.innerHTML += " currSpd: " + warden.currSpd;
        info.innerHTML += " Awareness: " + warden.awareness.toFixed(2);
        info.innerHTML += " Next Patrol: " + warden.nextPatrol + "<br / >";

    }

}


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
    data.X = 0;
    data.Y = 0;
    data.Escape = 0;
    data.trigger = { W: 0, S: 0, A: 0, D: 0, Jump: 0, crouch: 0, run: 0, light: 0 };

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
            case 69: data.Escape = 1; break;
            case 67: data.trigger.crouch = 1; break;
            case 70: data.trigger.light = 1; break;
            case 16: data.trigger.run = 1; break;
                //case 32: data.trigger.Jump = 1; break;
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
            case 70: data.trigger.light = 0; break;
            case 16: data.trigger.run = 0; break;
                //case 32: data.trigger.Jump = 0; break;
        }
    }, false);

    document.addEventListener("mousedown", function (event) {
        if (game.waitToEvaluate > 5) {
            game.first = false;
            if (event.pageX > 0.26 * canvas.width && event.pageX < 0.73 * canvas.width && event.pageY > 0.95 * canvas.height) {
                if (game.difficulty < 3) {
                    game.initialized = false;
                    if (game.hintTimer !== null) {
                        clearInterval(game.hintTimer);
                    }
                    if (game.warden.caught === false) {
                        game.difficulty++;
                    }
                }
                else {
                    if (game.warden.caught === true) {
                        game.initialized = false;
                        if (game.hintTimer !== null) {
                            clearInterval(game.hintTimer);
                        }
                    }
                }
            }
        }
        if (game.start === 0) {
            if (game.scene.children.length === 1575 && game.progress === 204) {
                if (event.pageX > 0.16 * canvas.width && event.pageX < 0.28 * canvas.width && event.pageY > 0.28 * canvas.height && event.pageY < 0.36 * canvas.height) {
                    game.start = 1;
                    game.clock.getDelta();
                }
            }
        }
        else {
            if (!document.pointerLockEnabled && game.waitToEvaluate <= 5) {
                canvas.requestPointerLock();
            }
            data.click = 1;
        }
    }, false);

    document.addEventListener("mouseup", function (event) {
        //data.click = 0;
    }, false);

    document.addEventListener("mousemove", function (event) {
        if (event.movementX > 0) {
            data.X = 1;
        }
        else {
            if (event.movementX < 0) {
                data.X = -1;
            }
            else {
                data.X = 0;
            }
        }

        if (event.movementY > 0) {
            data.Y = 1;
        }
        else {
            if (event.movementY < 0) {
                data.Y = -1;
            }
            else {
                data.Y = 0;
            }
        }

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
    }
}
