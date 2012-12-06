function Game(renderer, canvas) {
    // ------------------------------------------------------------------------
    // Public properties ------------------------------------------------------
    // ------------------------------------------------------------------------
    this.projector = new THREE.Projector();
    this.renderer = renderer;
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.objects = null;
    this.models = null;
    this.level = null;
    this.lights = null;
    this.skybox = null;
    this.player = null;
    this.oldplayer = null;
    this.initialized = false;
    this.soundManager = null;
    this.collisionSet = null;
    this.warden = null;
    this.old = null;
    this.key = 0;
    this.end = 0;
    this.nextGoal = null;
    this.gindex = 0;
    this.numCheck = 0;
    this.modelNum = null;
    this.again = false;

    // Create and position the map canvas, then add it to the document
    this.mainCanvas = document.getElementById("canvas");
    this.mapCanvas = document.createElement("canvas");
    this.mapCanvas.id = "minimap";
    this.mapCanvas.width = MAP_CELL_SIZE * NUM_CELLS.x;
    this.mapCanvas.height = MAP_CELL_SIZE * NUM_CELLS.z;
    this.mapCanvas.style.position = "absolute";
    this.mapCanvas.style.bottom = 0;
    this.mapCanvas.style.right = 0;
    this.mapCanvas.style.top = "20px";
    this.mapCanvas.style.right = "20px";
    document.getElementById("container").appendChild(this.mapCanvas);

    this.endingInfo = document.createElement("canvas");
    this.endingInfo.id = "endinginfo";
    this.endingInfo.width = canvas.width;
    this.endingInfo.height = canvas.height;
    this.endingInfo.style.position = "absolute";
    this.endingInfo.style.bottom = 0;
    this.endingInfo.style.right = 0;
    document.getElementById("container").appendChild(this.endingInfo);

    this.playerInfo = document.createElement("canvas");
    this.playerInfo.id = "info";
    this.playerInfo.width = canvas.width / 5;
    this.playerInfo.height = canvas.height / 3;
    this.playerInfo.style.position = "absolute";
    this.playerInfo.style.bottom = 0;
    this.playerInfo.style.right = 0;
    document.getElementById("container").appendChild(this.playerInfo);
    
    this.hints = document.createElement("canvas");
    this.hints.id = "hints";
    this.hints.width = canvas.width;
    this.hints.height = 100;
    this.hints.style.position = "absolute";
    this.hints.style.bottom = 0;
    this.hints.backgroundColor = "#000000";
    document.getElementById("container").appendChild(this.hints);
    
    this.hintIndex = 0;
    this.textHints = ['Use the WASD keys to move',
    				  'Use the mouse cursor to look around',
    				  'Press F to turn your flashlight on and off',
    				  'Press spacebar to jump',
    				  'Click to open doors and pick up items',
    				  'Pick up the key from the warden\'s office and find the locked door to escape',
    				  'Your heart beat indicates how close you are to being caught',
    				  'If your heart is beating fast, the warden is close. Stop moving and turn off your flashlight to hide',
    				  'Walk around carefully, good luck!'];

    // ------------------------------------------------------------------------
    // Private constants ------------------------------------------------------
    // ------------------------------------------------------------------------
    var FOV = 67,
        ASPECT = canvas.width / canvas.height,
        NEAR = .01,
        FAR = 1.5 * CELL_SIZE;

    // ------------------------------------------------------------------------
    // Game Methods -----------------------------------------------------------
    // ------------------------------------------------------------------------

    this.init = function (input) {
        console.log("Game initializing...");
        this.initialized = true;
        this.scene = new THREE.Scene();
        this.camera = null;
        this.objects = null;
        this.models = null;
        this.lights = [];
        this.level = null;
        this.skybox = null;
        this.player = null;
        this.oldplayer = new THREE.Vector3();
        this.warden = null;
        this.soundManager = null;
        this.collisionSet = null;
        this.old = new THREE.Vector3();
        this.old.x = -1;
        this.old.y = -1;
        this.old.z = -1;
        this.key = 0;
        this.end = 0;
        //goal list
        this.nextGoal = new Array(2);
        this.nextGoal[0] = [];
        this.nextGoal[1] = [];
        this.gindex = 0;
        this.numCheck = 0;
        this.modelNum = { number: 0 };
        this.again = false;
        // Setup scene


        //this.scene.add(new THREE.AmbientLight(0xaaaaaa));
        //this.scene.add(new THREE.AmbientLight(0x06080e));
        //this.scene.add(new THREE.AmbientLight(0x272727));

        // Load the level
        this.level = new Level(this);

        // Setup camera
        this.camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
        this.scene.add(this.camera);


        this.soundManager = new SoundManager();
        this.soundManager.init();

        this.skybox = new Skybox(this);
        
        // which element in the textHints array to display
        // start at -1 because the function updates
        this.hintIndex = 0;
        // set interval handles passing this weird, so you need to make a copy
        var _this = this;
        // update the hint every 5 seconds
        this.hintTimer = setInterval(function(){hintTimerFunc(_this)}, 5000);

        // Setup player
        this.player = new Player();
        this.player.init(this, this.scene, this.camera, this.level.startPos);
        this.oldplayer.x = this.player.mesh.position.x;
        this.oldplayer.y = this.player.mesh.position.y;
        this.oldplayer.z = this.player.mesh.position.z;

        // Initialize warden 
        this.warden = new Warden();
        this.warden.init(this.scene,
        					this.level.wardenPos,
        					this.level.patrolPos,
        					this);

        // Update the view ray (center of canvas into screen)
        this.player.updateViewRay(input);
        console.log("Game initialized.");
    };

    // Update everything in the scene
    // ------------------------------------------------------------------------


    var loaded = false;
    var once = true;
    this.update = function (input) {
        //if (this.player !== null) {
        //    console.log(this.player.mesh.position.y);
        //}
        if (this.initialized == false) {
            this.init(input);
        }

        this.level.update();

        this.player.update(input, this.scene);
        this.warden.update(this.player.getPosVec(),
        					this.player.sound,
        					this.player.lightOn);

        updateOperation(this, input);
        updatePlayerInformation(this, input);
        if (this.end === 1) {
            if (this.warden.caught)
                ending(this, 'You have been caught by the Warden.');
            else
                ending(this, 'Congratulations! You\'ve escaped from the Insane Asylum');
            return false;
        }
        
        handleCollisions(this, input);
        if (input.hold === 0 && input.Jump === 0) {
            input.Jump = 1;
            if (smallDrop(this)) {
                while (input.hold === 0) {
                    this.player.update(input);
                    handleCollisions(this, input);
                }
            }
        }
        if (updateCollisionSet(this) || this.again === true) {
            updateScene(this);
        }
        TWEEN.update();
        return true;
    };

    // Draw the scene as seen through the current camera
    // ------------------------------------------------------------------------
    this.render = function (input) {
        this.renderer.render(this.scene, this.camera);
    }
}; // end Game object

function ending(game, message) {
    var Ending = game.endingInfo.getContext("2d");
    // Clear
    Ending.save();
    Ending.setTransform(1, 0, 0, 1, 0, 0);
    Ending.clearRect(0, 0, game.endingInfo.width, game.endingInfo.height);
    Ending.restore();


    Ending.font = '50px Arial';
    Ending.textBaseline = 'middle';
    Ending.textAlign = 'center';
    Ending.fillStyle = '#00ff00';
    Ending.fillText(message, game.endingInfo.width / 2, game.endingInfo.height / 2);
}

function hints(game, message) {
    var hint = game.endingInfo.getContext("2d");
    // Clear
    hint.save();
    hint.setTransform(1, 0, 0, 1, 0, 0);
    hint.clearRect(0, 0, game.hints.width, game.hints.height);
    hint.restore();

    hint.font = '20px Arial';
    hint.textBaseline = 'bottom';
    hint.textAlign = 'center';
    hint.fillStyle = '#ffffff';
    hint.backgroundColor = '#000';
    hint.fillText(message, game.hints.width / 2, game.hints.height - 40);
}

function hintTimerFunc(game){
	if (game.hintIndex < game.textHints.length){
		hints(game, game.textHints[game.hintIndex]);
	}
	else {
		hints(game, "");
		clearInterval(game.hintTimer);
	}
	game.hintIndex++;
}

function updatePlayerInformation(game, input) {
    // Clear
    var playerContext = game.playerInfo.getContext("2d");
    playerContext.save();
    playerContext.setTransform(1, 0, 0, 1, 0, 0);
    playerContext.clearRect(0, 0, game.playerInfo.width, game.playerInfo.height);
    playerContext.restore();

    // Draw the direction information
    playerContext.beginPath();
    playerContext.strokeStyle = "#7f7f7f";
    playerContext.lineWidth = 2;
    playerContext.arc(game.playerInfo.width / 2, game.playerInfo.height / 2, 60, 0, 2 * Math.PI, false);
    playerContext.stroke();

    playerContext.beginPath();
    playerContext.strokeStyle = "#7f7f7f";
    playerContext.lineWidth = 2;
    playerContext.arc(game.playerInfo.width / 2, game.playerInfo.height / 2, 50, 0, 2 * Math.PI, false);
    playerContext.stroke();

    playerContext.font = '20px Arial';
    playerContext.textBaseline = 'middle';
    playerContext.textAlign = 'center';
    playerContext.fillStyle = '#00ff00';
    playerContext.fillText(game.nextGoal[game.gindex][1], game.playerInfo.width / 2, game.playerInfo.height / 2);

    //calculate the distance between the player and the next goal
    var dis = Math.sqrt((game.player.mesh.position.x - game.nextGoal[game.gindex][0].x) * (game.player.mesh.position.x - game.nextGoal[game.gindex][0].x) +
                        (game.player.mesh.position.z - game.nextGoal[game.gindex][0].z) * (game.player.mesh.position.z - game.nextGoal[game.gindex][0].z));

    var angle = 0;
    if (dis < CELL_SIZE) {
        angle = 2 * Math.PI;
    }
    else {
        if (dis > 24 * CELL_SIZE) {
            angle = -Math.PI / 12;
        }
        else {
            angle = -(-Math.PI / 12 * dis / CELL_SIZE + 25 / 12 * Math.PI);
        }
    }
    var direction1 = Math.atan2(game.nextGoal[game.gindex][0].z - game.player.mesh.position.z, game.nextGoal[game.gindex][0].x - game.player.mesh.position.x);
    var direction2 = input.center + input.phi;
    playerContext.beginPath();
    playerContext.strokeStyle = "#ffff00";
    playerContext.lineWidth = 10;
    if (angle < 2 * Math.PI) {
        playerContext.arc(game.playerInfo.width / 2, game.playerInfo.height / 2, 55, -Math.PI / 2 + direction1 - direction2 - angle / 2, -Math.PI / 2 + direction1 - direction2 + angle / 2, true);
    }
    else {
        playerContext.arc(game.playerInfo.width / 2, game.playerInfo.height / 2, 55, 0, angle, true);
    }
    playerContext.stroke();
}




function updateCollisionSet(game) {
    var rx = Math.floor(Math.floor(game.player.mesh.position.x) / CELL_SIZE + 1 / 2);
    var rz = Math.floor(Math.floor(game.player.mesh.position.z) / CELL_SIZE + 1 / 2);
    var ry = Math.floor(Math.floor(game.player.mesh.position.y) / CELL_SIZE);
    if (rx != game.old.x || ry != game.old.y || rz != game.old.z) {
        game.collisionSet = [];

        var append = false;
        for (var z = rz - 1; z <= rz + 1; z++) {
            if (z < 0 || z >= NUM_CELLS.z) {
                continue;
            }
            for (var x = rx - 1; x <= rx + 1; x++) {
                if (x < 0 || x >= NUM_CELLS.x) {
                    continue;
                }


                for (var o = 0; o < game.objects[ry][z][x].length; o++) {
                    game.collisionSet.push(game.objects[ry][z][x][o]);
                    if (game.objects[ry][z][x][o].name === 'stair' || game.objects[ry][z][x][o].name === 'side' || game.objects[ry][z][x][o].name === 'support' || game.objects[ry][z][x][o].name === 'ceil2') {
                        append = true;
                    }
                }
            }
        }

        if (append === true) {
            for (var z = rz - 1; z <= rz + 1; z++) {
                if (z < 0 || z >= NUM_CELLS.z) {
                    continue;
                }
                for (var x = rx - 1; x <= rx + 1; x++) {
                    if (x < 0 || x >= NUM_CELLS.x) {
                        continue;
                    }
                    for (var y = ry - 1; y <= ry + 1; y += 2) {
                        if (y < 0 || y >= NUM_CELLS.y) {
                            continue;
                        }
                        for (var o = 0; o < game.objects[y][z][x].length; o++) {
                            game.collisionSet.push(game.objects[y][z][x][o]);
                        }
                    }
                }
            }
        }
        return true;
    }
    else {
        return false;
    }
}

function updateScene(game) {
    if (game.modelNum.number !== game.numCheck) {
        game.again = true;
    }
    else {
        game.again = false;
    }
    if (game.old.x !== -1) {
        var ox = game.old.x;
        var oz = game.old.z;
        var oy = game.old.y;

        for (var y = oy - 1; y <= oy + 1; y++) {
            if (y < 0 || y >= NUM_CELLS.y) {
                continue;
            }
            for (var z = oz - 2; z <= oz + 2; z++) {
                if (z < 0 || z >= NUM_CELLS.z) {
                    continue;
                }
                for (var x = ox - 2; x <= ox + 2; x++) {
                    if (x < 0 || x >= NUM_CELLS.x) {
                        continue;
                    }
                    for (var o = 0; o < game.objects[y][z][x].length; o++) {
                        game.scene.remove(game.objects[y][z][x][o]);
                    }

                    for (var o = 0; o < game.models[y][z][x].length; o++) {
                        game.scene.remove(game.models[y][z][x][o]);
                    }
                }
            }
        }
    }

    var rx = Math.floor(Math.floor(game.player.mesh.position.x) / CELL_SIZE + 1 / 2);
    var rz = Math.floor(Math.floor(game.player.mesh.position.z) / CELL_SIZE + 1 / 2);
    var ry = Math.floor(Math.floor(game.player.mesh.position.y) / CELL_SIZE);

    var append = false;
    for (var z = rz - 2; z <= rz + 2; z++) {
        if (z < 0 || z >= NUM_CELLS.z) {
            continue;
        }
        for (var x = rx - 2; x <= rx + 2; x++) {
            if (x < 0 || x >= NUM_CELLS.x) {
                continue;
            }

            for (var o = 0; o < game.objects[ry][z][x].length; o++) {
                game.scene.add(game.objects[ry][z][x][o]);
                if (game.objects[ry][z][x][o].name === 'stair' || game.objects[ry][z][x][o].name === 'side' || game.objects[ry][z][x][o].name === 'support' || game.objects[ry][z][x][o].name === 'ceil2') {
                    append = true;
                }
            }

            for (var o = 0; o < game.models[ry][z][x].length; o++) {
                game.scene.add(game.models[ry][z][x][o]);
            }
        }
    }

    if (append === true) {
        for (var z = rz - 2; z <= rz + 2; z++) {
            if (z < 0 || z >= NUM_CELLS.z) {
                continue;
            }
            for (var x = rx - 2; x <= rx + 2; x++) {
                if (x < 0 || x >= NUM_CELLS.x) {
                    continue;
                }
                for (var y = ry - 1; y <= ry + 1; y += 2) {
                    if (y < 0 || y >= NUM_CELLS.y) {
                        continue;
                    }
                    for (var o = 0; o < game.objects[y][z][x].length; o++) {
                        game.scene.add(game.objects[y][z][x][o]);
                    }

                    for (var o = 0; o < game.models[y][z][x].length; o++) {
                        game.scene.add(game.models[y][z][x][o]);
                    }
                }
            }
        }
    }
    game.old.x = rx;
    game.old.y = ry;
    game.old.z = rz;
}

var DOOR_TIMEOUT = 750; // milliseconds between door toggles
function updateOperation(game, input) {
    if (input.click === 1) {
        input.click = 0;
        var rx = Math.floor(Math.floor(game.player.mesh.position.x) / CELL_SIZE + 1 / 2);
        var rz = Math.floor(Math.floor(game.player.mesh.position.z) / CELL_SIZE + 1 / 2);
        var ry = Math.floor(Math.floor(game.player.mesh.position.y) / CELL_SIZE);
        for (var z = rz - 1; z <= rz + 1; z++) {
            if (z < 0 || z >= NUM_CELLS.z) {
                continue;
            }
            for (var x = rx - 1; x <= rx + 1; x++) {
                if (x < 0 || x >= NUM_CELLS.x) {
                    continue;
                }

                var collision = input.viewRay.intersectObjects(game.objects[ry][z][x]);
                if (collision.length > 0) {
                    switch (collision[0].object.name) {
                        case 'door':
                            var door = collision[0].object, tween;
                            var ob = door.model;
                            if (door.doorState === "closed" && door.canToggle) {
                                var ix = door.position.x - door.halfsize * 16 / 17 * Math.sin(door.beginRot);
                                var iz = door.position.z - door.halfsize * 16 / 17 * Math.cos(door.beginRot);
                                tween = new TWEEN.Tween({ rot: door.beginRot })
                                                 .to({ rot: door.endRot }, DOOR_TIMEOUT)
                                                 .easing(TWEEN.Easing.Elastic.Out)
                                                 .onUpdate(function () {
                                                     door.rotation.y = this.rot;
                                                     ob.rotation.y = this.rot;
                                                     door.position.x = ix + door.halfsize * 16 / 17 * Math.sin(this.rot);
                                                     door.position.z = iz + door.halfsize * 16 / 17 * Math.cos(this.rot);
                                                     ob.position.x = door.position.x;
                                                     ob.position.z = door.position.z;

                                                 })
                                                 .start();

                                door.doorState = "open";
                                door.canToggle = false;

                                setTimeout(function () {
                                    door.canToggle = true;
                                }, DOOR_TIMEOUT);
                            } else if (door.doorState === "open" && door.canToggle) {
                                var ix = door.position.x - door.halfsize * 16 / 17 * Math.sin(door.endRot);
                                var iz = door.position.z - door.halfsize * 16 / 17 * Math.cos(door.endRot);
                                tween = new TWEEN.Tween({ rot: door.endRot })
                                    .to({ rot: door.beginRot }, DOOR_TIMEOUT)
                                    .easing(TWEEN.Easing.Elastic.Out)
                                    .onUpdate(function () {
                                        door.rotation.y = this.rot;
                                        ob.rotation.y = this.rot;
                                        door.position.x = ix + door.halfsize * 16 / 17 * Math.sin(this.rot);
                                        door.position.z = iz + door.halfsize * 16 / 17 * Math.cos(this.rot);
                                        ob.position.x = door.position.x;
                                        ob.position.z = door.position.z;

                                    })
                                    .start();

                                door.doorState = "closed";
                                door.canToggle = false;

                                setTimeout(function () {
                                    door.canToggle = true;
                                }, DOOR_TIMEOUT);
                            }
                            break;
                        case 'key':
                            game.scene.remove(collision[0].object);
                            game.scene.remove(collision[0].object.model);
                            for (var m = 0; m < game.models[ry][z][x].length; m++) {
                                if (game.models[ry][z][x][m] === collision[0].object.model) {
                                    game.models[ry][z][x].splice(m, 1);
                                    break;
                                }
                            }

                            for (var o = 0; o < game.objects[ry][z][x].length; o++) {
                                if (game.objects[ry][z][x][o] === collision[0].object) {
                                    game.objects[ry][z][x].splice(o, 1);
                                    break;
                                }
                            }
                            game.old.x = -1;
                            game.old.y = -1;
                            game.old.z = -1;
                            game.key = 1;
                            game.gindex++;
                            break;
                        case 'fdoor':
                            if (game.key === 1) {
                                game.end = 1;
                            }
                            break;
                    }
                }
            }
        }
    }
}

function smallDrop(game) {
    for (var vertexIndex = 0; vertexIndex < game.player.mesh.geometry.vertices.length; vertexIndex++) {
        var directionVector = game.player.mesh.geometry.vertices[vertexIndex].clone();
        for (var t = 0.0; t <= 2; t = t + 0.1) {
            ray = new THREE.Ray(new THREE.Vector3(game.player.mesh.position.x, game.player.mesh.position.y - t, game.player.mesh.position.z), directionVector.clone().normalize());
            collisionResults = ray.intersectObjects(game.collisionSet);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                return true;
            }
        }
    }
    return false;
}


function bumpUp(collisionResults, directionVector, game) {
    var t;
    for (t = 0.1; t <= 5; t = t + 0.1) {
        ray = new THREE.Ray(new THREE.Vector3(game.player.mesh.position.x, game.player.mesh.position.y + t, game.player.mesh.position.z), directionVector.clone().normalize());
        collisionResults = ray.intersectObjects(game.collisionSet);
        if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() > 1e-6) {
            break;
        }
    }


    for (var vertexIndex = 0; vertexIndex < game.player.mesh.geometry.vertices.length; vertexIndex++) {
        var allDirectionVector = game.player.mesh.geometry.vertices[vertexIndex].clone();
        var ray = new THREE.Ray(new THREE.Vector3(game.player.mesh.position.x, game.player.mesh.position.y + t, game.player.mesh.position.z), allDirectionVector.clone().normalize());
        var allCollisionResults = ray.intersectObjects(game.collisionSet);
        if (allCollisionResults.length > 0 && allCollisionResults[0].distance - allDirectionVector.length() < -1e-6) {
            return vertexIndex;
        }
    }
    game.player.mesh.position.y += t;
    return -1;
}


function bumpBack(collisionResults, directionVector, game) {
    var i = 0;
    var j = 0;
    var k = 0;
    var bumpx = 0;
    var bumpy = 0;
    var bumpz = 0;
    if (game.player.mesh.position.x - game.oldplayer.x > 0) {
        bumpx = 0;
        for (i = 0.1; i <= game.player.mesh.position.x - game.oldplayer.x; i += 0.1) {
            ray = new THREE.Ray(new THREE.Vector3(game.oldplayer.x + i, game.oldplayer.y, game.oldplayer.z), directionVector.clone().normalize());
            collisionResults = ray.intersectObjects(game.collisionSet);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                bumpx = -1;
                break;
            }
        }

        i -= 0.1;
    }
    if (game.player.mesh.position.x - game.oldplayer.x < 0) {
        bumpx = 0;
        for (i = -0.1; i >= game.player.mesh.position.x - game.oldplayer.x; i -= 0.1) {
            ray = new THREE.Ray(new THREE.Vector3(game.oldplayer.x + i, game.oldplayer.y, game.oldplayer.z), directionVector.clone().normalize());
            collisionResults = ray.intersectObjects(game.collisionSet);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                bumpx = 1;
                break;
            }
        }

        i += 0.1;

    }

    if (game.player.mesh.position.y - game.oldplayer.y > 0) {
        bumpy = 0;
        for (j = 0.1; j <= game.player.mesh.position.y - game.oldplayer.y; j += 0.1) {
            ray = new THREE.Ray(new THREE.Vector3(game.oldplayer.x + i, game.oldplayer.y + j, game.oldplayer.z), directionVector.clone().normalize());
            collisionResults = ray.intersectObjects(game.collisionSet);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                bumpy = -1;
                break;
            }
        }

        j -= 0.1;

    }
    if (game.player.mesh.position.y - game.oldplayer.y < 0) {
        bumpy = 0;
        for (j = -0.1; j >= game.player.mesh.position.y - game.oldplayer.y; j -= 0.1) {
            ray = new THREE.Ray(new THREE.Vector3(game.oldplayer.x + i, game.oldplayer.y + j, game.oldplayer.z), directionVector.clone().normalize());
            collisionResults = ray.intersectObjects(game.collisionSet);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                bumpy = 1;
                break;
            }
        }

        j += 0.1;

    }

    if (game.player.mesh.position.z - game.oldplayer.z > 0) {
        bumpz = 0;
        for (k = 0.1; k <= game.player.mesh.position.z - game.oldplayer.z; k += 0.1) {
            ray = new THREE.Ray(new THREE.Vector3(game.oldplayer.x + i, game.oldplayer.y + j, game.oldplayer.z + k), directionVector.clone().normalize());
            collisionResults = ray.intersectObjects(game.collisionSet);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                bumpz = -1;
                break;
            }
        }

        k -= 0.1;

    }
    if (game.player.mesh.position.z - game.oldplayer.z < 0) {
        bumpz = 0;
        for (k = -0.1; k >= game.player.mesh.position.z - game.oldplayer.z; k -= 0.1) {
            ray = new THREE.Ray(new THREE.Vector3(game.oldplayer.x + i, game.oldplayer.y + j, game.oldplayer.z + k), directionVector.clone().normalize());
            collisionResults = ray.intersectObjects(game.collisionSet);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                bumpz = 1;
                break;
            }
        }
        if (bumpz === 1) {
            k += 0.1;
        }
    }

    game.player.mesh.position.add(game.oldplayer, new THREE.Vector3(i, j, k));
    return bumpy;
}

// ----------------------------------------------------------------------------
// Handle collision detection
// ----------------------------------------------------------------------------

function handleCollisions(game, input) {
    if (input.trigger.A || input.trigger.D || input.trigger.W || input.trigger.S || input.hold === 0) {
        var count = 0;
        for (var vertexIndex = 0; vertexIndex < game.player.mesh.geometry.vertices.length; vertexIndex++) {
            var directionVector = game.player.mesh.geometry.vertices[vertexIndex].clone();
            var ray = new THREE.Ray(game.player.mesh.position, directionVector.clone().normalize());
            var collisionResults = ray.intersectObjects(game.collisionSet);
            var g = 0;
            while (g < collisionResults.length) {
                if (collisionResults[g].object.name === "door" && collisionResults[g].object.doorState === 'open') {
                    collisionResults.splice(g, 1);
                } else {
                    g++;
                }
            }

            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < 1e-6) {
                var selected = collisionResults[0].object;
                if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                    if (selected.name === 'ceil' || selected.name === 'ceil2' || selected.name === 'wall' || selected.name === 'window' || selected.name === 'side' || selected.name === 'support' ||
                        selected.name === 'column' || selected.name === 'model' || selected.name === 'key' || selected.name === 'fdoor' || selected.name === 'door') {
                        var verticalInfo = bumpBack(collisionResults, directionVector, game);
                        if (verticalInfo != 0) {
                            input.v = 0;
                            if (verticalInfo > 0) {
                                input.hold = 1;
                            }
                        }
                    }
                    else {
                        if (selected.name === 'stair' || selected.name === 'floor') {
                            input.hold = 1;
                            input.v = 0;
                            var newCollide = bumpUp(collisionResults, directionVector, game);
                            if (newCollide !== -1) {
                                bumpBack(collisionResults, directionVector, game);
                            }
                        }
                    }
                }
            }
            else {
                count++;
            }
        }
        if (count === game.player.mesh.geometry.vertices.length) {
            input.hold = 0;
        }
        game.oldplayer.copy(game.player.mesh.position);
    }
}

