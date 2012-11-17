function Game(renderer, canvas) {
    // ------------------------------------------------------------------------
    // Public properties ------------------------------------------------------
    // ------------------------------------------------------------------------
    this.projector = new THREE.Projector();
    this.renderer = renderer;
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.objects = [];
    this.level = null;
    this.player = null;
    this.oldplayer = new THREE.Vector3();
    this.initialized = false;

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

    // ------------------------------------------------------------------------
    // Private constants ------------------------------------------------------
    // ------------------------------------------------------------------------
    var FOV = 67,
        ASPECT = canvas.width / canvas.height,
        NEAR = .01,
        FAR = 1000;

    // ------------------------------------------------------------------------
    // Game Methods -----------------------------------------------------------
    // ------------------------------------------------------------------------

    this.init = function (input) {
        console.log("Game initializing...");
        this.initialized = true;
        this.scene = null;
        this.camera = null;
        this.objects = [];
        this.lights = [];
        this.level = null;
        this.player = null;
		this.warden = null; 
		
        // Setup scene
        this.scene = new THREE.Scene();
        //this.scene.add(new THREE.AmbientLight(0xaaaaaa));
        this.scene.add(new THREE.AmbientLight(0x1f1f1f));

        // Load the test level
        this.level = new Level(this);
        
		// Setup camera
        this.camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
        this.scene.add(this.camera);
		
		this.player = new Player();
		this.player.init( this.scene, this.camera ); 
		this.player.setStartPos( this.level.startPos ); 
        // Setup player
        /*
        this.player = new THREE.Mesh(
            new THREE.CubeGeometry(9, 17, 3.5),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        );
        this.player.position.set(
            this.level.startPos.x, this.level.startPos.y + 8.5, this.level.startPos.z);
        this.scene.add(this.player);
		*/
		// Initialize warden(s) 
		
		this.warden = new Warden(); 
		this.warden.init( this.scene ); 
		this.warden.setStartPos( this.level.wardenPos ); 
		
        

        // Update the view ray (center of canvas into screen)
        var rayVec = new THREE.Vector3(0, 0, 1);
        this.projector.unprojectVector(rayVec, this.camera);
        var playPos = this.player.getPosVec(); 
        input.viewRay = new THREE.Ray(
            playPos,                             // origin
            rayVec.subSelf( playPos ).normalize(), // direction
            0, 1000                                           // near, far
        );

		/*
        // Setup a light that will move with the player
        this.lights[0] = new THREE.SpotLight(0xffffff, 10, 100);
        this.lights[0].position.set(
            this.player.position.x,
            this.player.position.y,
            this.player.position.z);

        this.lights[0].target.position.set(
            this.player.position.x + input.viewRay.direction.x,
            this.player.position.y + input.viewRay.direction.y,
            this.player.position.z + input.viewRay.direction.z);
        this.lights[0].castShadow = true;
        this.lights[0].shadowCameraNear = 0;
        this.lights[0].shadowCameraFar = 5;
        this.lights[0].shadowCameraVisible = true;
        this.scene.add(this.lights[0]);
		*/ 
        console.log("Game initialized.");
    };

    // Update everything in the scene
    // ------------------------------------------------------------------------
    this.update = function (input) {
        if (this.initialized == false) {
            this.init(input);
        }
        this.level.update(); 
        updateMovement( this, input);
        this.warden.update( this.player.getPosVec() );
        handleCollisions(this, input);
        while (input.hold === 0 && input.Jump === 0) {
            updateMovement(this, input);
            handleCollisions(this, input);
        }
    };

    // Draw the scene as seen through the current camera
    // ------------------------------------------------------------------------
    this.render = function (input) {
        this.renderer.render(this.scene, this.camera);
    }
}; // end Game object

// ----------------------------------------------------------------------------
// Update based on player movement: camera, player position/jumping, view ray
// ----------------------------------------------------------------------------
var PLAYER_MOVE_SPEED = 0.6;
function updateMovement(game, input) {
    var triggerAD = input.trigger.A - input.trigger.D,
        triggerWS = input.trigger.W - input.trigger.S,
        jumpVelocity = 4;

    // Reorient camera
    if (!document.pointerLockEnabled) {
        if ((input.mouseX - canvas.offsetLeft) / canvas.width < 0.2) {
            input.center -= 0.1 * (0.2 - (input.mouseX - canvas.offsetLeft) / canvas.width);
        }
        if ((input.mouseX - canvas.offsetLeft) / canvas.width > 0.8) {
            input.center += 0.1 * ((input.mouseX - canvas.offsetLeft) / canvas.width - 0.8);
        }
    }
    input.f.z = Math.sin(input.theta) * Math.sin(input.phi + input.center)
    input.f.x = Math.sin(input.theta) * Math.cos(input.phi + input.center);
    input.f.y = Math.cos(input.theta);

    // Handle jumping
    if (input.hold === 1) {
        input.Jump = 0;
        if (input.trigger.Jump === 1) {
            input.v = jumpVelocity;
            input.trigger.Jump = 0;
            input.Jump = 1;
            input.hold = 0;
            input.v -= 0.4;
            game.player.mesh.position.y += input.v;
        }
    } else {
        input.v -= 0.4;
        game.player.mesh.position.y += input.v;
    }

    // Update player position
    var xzNorm = Math.sqrt(input.f.x * input.f.x + input.f.z * input.f.z);
    game.player.mesh.position.add(
        game.player.mesh.position,
        new THREE.Vector3(
            PLAYER_MOVE_SPEED * (triggerWS * input.f.x + triggerAD * input.f.z / xzNorm),
            0,
            PLAYER_MOVE_SPEED * (triggerWS * input.f.z - triggerAD * input.f.x / xzNorm)
        )
    );

    // Update camera position/lookat 
    game.camera.position = game.player.mesh.position;
    var look = new THREE.Vector3();
    look.add(game.camera.position, input.f);
    game.camera.lookAt(look);

    // Update the view ray (center of canvas into screen)
    var rayVec = new THREE.Vector3(0, 0, 1);
    game.projector.unprojectVector(rayVec, game.camera);
    input.viewRay = new THREE.Ray(
        game.player.mesh.position,                             // origin
        rayVec.subSelf(game.player.mesh.position).normalize(), // direction
        0, 1000                                           // near, far
    );

	//Update the player's light
    game.player.updateLight( input.viewRay.direction );
    
    /*game.lights[0].position.set(
        game.player.position.x,
        game.player.position.y,
        game.player.position.z);

    game.lights[0].target.position.set(
            game.player.position.x + input.viewRay.direction.x,
            game.player.position.y + input.viewRay.direction.y,
            game.player.position.z + input.viewRay.direction.z);
    */
}

function bumpUp(collisionResults, directionVector, game) {
    for (var t = 1; t <= 50; t ++) {
        game.player.mesh.position.y += 0.1;
        ray = new THREE.Ray(new THREE.Vector3(game.player.mesh.position.x, game.player.mesh.position.y, game.player.mesh.position.z), directionVector.clone().normalize());
        collisionResults = ray.intersectObjects(game.objects);
        if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() > 1e-6) {
            return true; 
        }
    }
    return false;    
}


function bumpBack(collisionResults, directionVector, game) {
    var i = 0;
    var j = 0;
    var k = 0;
    if (game.player.mesh.position.x - game.oldplayer.x > 0) {
        for (i = 0.1; i <= game.player.mesh.position.x - game.oldplayer.x; i += 0.1) {
     
            ray = new THREE.Ray(new THREE.Vector3(game.oldplayer.x + i, game.oldplayer.y, game.oldplayer.z), directionVector.clone().normalize());
            collisionResults = ray.intersectObjects(game.objects);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                break;
            }
        }
        i -= 0.1;
    }
    if (game.player.mesh.position.x - game.oldplayer.x < 0) {
        for (i = -0.1; i >= game.player.mesh.position.x - game.oldplayer.x; i -= 0.1) {
            ray = new THREE.Ray(new THREE.Vector3(game.oldplayer.x + i, game.oldplayer.y, game.oldplayer.z), directionVector.clone().normalize());
            collisionResults = ray.intersectObjects(game.objects);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                break;
            }
        }
        i += 0.1;
    }

    if (game.player.mesh.position.y - game.oldplayer.y > 0) {
        for (j = 0.1; j <= game.player.mesh.position.y - game.oldplayer.y; j += 0.1) {
            ray = new THREE.Ray(new THREE.Vector3(game.oldplayer.x + i, game.oldplayer.y + j, game.oldplayer.z), directionVector.clone().normalize());
            collisionResults = ray.intersectObjects(game.objects);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                break;
            }
        }
        j -= 0.1;
    }
    if (game.player.mesh.position.y - game.oldplayer.y < 0) {
        for (j = -0.1; j >= game.player.mesh.position.y - game.oldplayer.y; j -= 0.1) {
            ray = new THREE.Ray(new THREE.Vector3(game.oldplayer.x + i, game.oldplayer.y + j, game.oldplayer.z), directionVector.clone().normalize());
            collisionResults = ray.intersectObjects(game.objects);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                break;
            }
        }
        j += 0.1;
    }

    if (game.player.mesh.position.z - game.oldplayer.z > 0) {
        for (k = 0.1; k <= game.player.mesh.position.z - game.oldplayer.z; k += 0.1) {
            ray = new THREE.Ray(new THREE.Vector3(game.oldplayer.x + i, game.oldplayer.y + j, game.oldplayer.z + k), directionVector.clone().normalize());
            collisionResults = ray.intersectObjects(game.objects);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                break;
            }
        }
        k -= 0.1;
    }
    if (game.player.mesh.position.z - game.oldplayer.z < 0) {
        for (k = -0.1; k >= game.player.mesh.position.z - game.oldplayer.z; k -= 0.1) {
            ray = new THREE.Ray(new THREE.Vector3(game.oldplayer.x + i, game.oldplayer.y + j, game.oldplayer.z + k), directionVector.clone().normalize());
            collisionResults = ray.intersectObjects(game.objects);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                break;
            }
        }
        k += 0.1;
    }

    game.player.mesh.position.add(game.oldplayer, new THREE.Vector3(i, j, k));
    game.camera.position.set(game.player.mesh.position.x, game.player.mesh.position.y, game.player.mesh.position.z);
}

// ----------------------------------------------------------------------------
// Handle collision detection
// ----------------------------------------------------------------------------
function handleCollisions(game, input) {
    if (input.trigger.A || input.trigger.D || input.trigger.W || input.trigger.S || input.hold === 0) {
        input.hold = 0;
        for (var vertexIndex = 0; vertexIndex < game.player.mesh.geometry.vertices.length; vertexIndex++) {
            var directionVector = game.player.mesh.geometry.vertices[vertexIndex].clone();
            var ray = new THREE.Ray(game.player.mesh.position, directionVector.clone().normalize());
            var collisionResults = ray.intersectObjects(game.objects);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < 1e-6) {
                var selected = collisionResults[0].object;
                if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                    if (selected.name == 'floor' || selected.name == 'ceiling' || selected.name == 'wall') {
                        bumpBack(collisionResults, directionVector, game);
                    }
                    else {
                        if (selected.name == 'stair') {
                            if (bumpUp(collisionResults, directionVector, game) === false) {
                                bumpBack(collisionResults, directionVector, game);
                            }
                        }
                    }
                }

                if (selected.name === 'floor' || selected.name === 'stair') {
                    ray = new THREE.Ray(new THREE.Vector3().add(game.player.mesh.position, new THREE.Vector3(0, -0.1, 0)), directionVector.clone().normalize());
                    collisionResults = ray.intersectObjects(game.objects);
                    if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                        input.hold = 1;
                        input.v = 0;
                    }
                }
                else {
                    if (selected.name === 'ceiling') {
                        ray = new THREE.Ray(new THREE.Vector3().add(game.player.mesh.position, new THREE.Vector3(0, 0.1, 0)), directionVector.clone().normalize());
                        collisionResults = ray.intersectObjects(game.objects);
                        if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                            input.v = 0;
                        }
                    }
                }
            }
        }

        game.oldplayer.copy(game.player.mesh.position);
    }
}

