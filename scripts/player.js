function Player() {

    //player definition
    this.game = null;
    this.mesh = null;
    this.input = null;
    this.camera = null;
    this.flashlight = null;

    //general sounds
    this.soundManager;
    this.countAssets = 4; // number of sound files to be loaded

    //heartbeat variables
    this.lastbeat = 0;
    this.heartbeat = "./sounds/heartbeat.mp3";

    //footstep variables
    this.laststep = 0;
    this.footsteps = new Array();
    this.footsteps[0] = "./sounds/step1.mp3";
    this.footsteps[1] = "./sounds/step2.mp3";
    this.footsteps[2] = "./sounds/step3.mp3";


    //mechanic variables
    var speed = 0.7;
    var jumpVel = 3;
    this.currSpd = speed;
    this.sound = 0;
    this.vY = 0;
    this.lightTog = false;
    this.lightOn = true;
    this.crouch = 0;
    this.toggleCrouch = false;

    this.init = function (game, scene, camera, startPos) {

        this.camera = camera;
        this.game = game;
        this.soundManager = game.soundManager;

        standMesh = new THREE.Mesh(
			new THREE.CubeGeometry(5, 20, 5),
            new THREE.MeshBasicMaterial({ map: TRANSPARENT_TEXTURE })
		);

        creepMesh = new THREE.Mesh(
			new THREE.CubeGeometry(5, 5, 5),
            new THREE.MeshBasicMaterial({ map: TRANSPARENT_TEXTURE })
		);

        standMesh.name = 'player';
        creepMesh.name = 'player';
        this.mesh = standMesh;

        this.flashlight = new THREE.SpotLight(0xfffed9, 10, 3 * CELL_SIZE);
        scene.add(this.mesh);
        scene.add(this.flashlight);

        this.setStartPos(startPos);

        game.soundManager.loadSound(this.heartbeat);
        game.soundManager.loadSound(this.footsteps[0]);
        game.soundManager.loadSound(this.footsteps[1]);
        game.soundManager.loadSound(this.footsteps[2]);
    }

    //pass in level.startPos
    this.setStartPos = function (vec3) {

        var x = vec3.x, y = vec3.y + 10, z = vec3.z;

        this.mesh.position.set(x, y, z);
        this.flashlight.position.set(x, y, z);
        this.camera.position.set(x, y + 9, z);

    }

    this.getPosVec = function () {
        return this.mesh.position;
    }


    this.soundLoaded = function (distance, movement, speed) {

        var start = new Date().getTime();
		var ry = this.mesh.position.y;
        
        ry = ( ry > CELL_SIZE ) ? 1 : 0 ;
        
        //heartbeat
        //base rate of .5 seconds, and can go as high as 5 seconds
        var timeout = 500 + (distance * 5);
        timeout = ( ry == 1 || timeout > 5000) ? 5000 : timeout;
		if (start - this.lastbeat > timeout) {
            this.soundManager.playSound(this.heartbeat, 0);
            this.lastbeat = start;
        }


        if (movement) {

            //step sound clips are around 300-400 ms, so need to stay above that
            // in order for them to sound regular. 
            timeout = 1250 - (500 * speed);
            if (start - this.laststep > timeout) {

                //selected random from one of the footstep sounds
                var step = Math.floor(Math.random() * this.footsteps.length);
                this.soundManager.playSound(this.footsteps[step], 0);
                this.laststep = start;
            }
        } else {
            //so steps start right away on movement
            this.laststep = 0;
        }

    }

    this.soundLoad = function (distance, movement, speed) {

        var loadHelper = function (player, soundmanager, variable) {
            var tempBuff;

            if ((tempBuff = soundmanager.returnBuffer(variable))) {
                console.log("Sound Ready: " + variable + " CountAssets: " + player.countAssets);
                variable = tempBuff;
                player.countAssets--;
            }

            return variable;
        }

        // for more player sounds, expand here. 
        this.heartbeat = loadHelper(this, this.soundManager, this.heartbeat);
        this.footsteps[0] = loadHelper(this, this.soundManager, this.footsteps[0]);
        this.footsteps[1] = loadHelper(this, this.soundManager, this.footsteps[1]);
        this.footsteps[2] = loadHelper(this, this.soundManager, this.footsteps[2]);

        if (this.countAssets == 0) {
            console.log("All Loaded, switching to playing sounds");
            this.playSounds = this.soundLoaded;
            return true;
        } else {
            return false;
        }
    }

    //playSounds is a meta function, first it points out soundLoad, then after
    //  soundLoad has done its thing, it switches to soundLoaded, which has the
    //  code to play the sounds.   
    this.playSounds = this.soundLoad;

    this.update = function (input, scene, value) {
        //current position.
        var X = this.mesh.position.x;
        var Z = this.mesh.position.z;

        this.sound = this.updateMovement(input, scene);

        if (this.game.warden.mesh) {
            var warPos = this.game.warden.mesh.position;

            var dX = warPos.x - X;
            var dZ = warPos.z - Z;

            var d = Math.sqrt(dX * dX + dZ * dZ);
            if (value === 1) {
                this.playSounds(d, this.sound, this.currSpd);
            }

        } else {
            if (value === 1) {
                this.playSounds(1000, this.sound, this.currSpd);
            }
        }

        this.updateViewRay(input);
        this.updateLight(input.trigger.light, input.viewRay.direction);
    }

    this.updateViewRay = function (input) {
        var rayVec = new THREE.Vector3(0, 0, 1);
        this.game.projector.unprojectVector(rayVec, this.camera);
        var playPos = this.mesh.position;
        input.viewRay = new THREE.Ray(
            playPos,                             // origin
            rayVec.subSelf(playPos).normalize(), // direction
            0, 1000                              // near, far
        );
    }

    this.updateMovement = function (input, scene) {
        //adjust for running or crouching, or neither: 
        this.currSpd = speed;
        if (input.trigger.run) {
            this.currSpd *= 2;
        }
        if (this.crouch) {
            this.currSpd /= 2;
        }

        if (input.trigger.crouch) {
            if (!this.toggleCrouch) {
                this.crouch = 1 - this.crouch;
                this.toggleCrouch = true;

                if (input.hold === 1) {
                    if (this.crouch) {
                        //rather than switching between two meshes, 
                        //  why not scale the existing?
                        var oldx = this.mesh.position.x;
                        var oldy = this.mesh.position.y;
                        var oldz = this.mesh.position.z;
                        scene.remove(this.mesh);
                        this.mesh = creepMesh;
                        scene.add(this.mesh);
                        this.mesh.position.set(oldx, oldy - 7.5, oldz);
                        //this.mesh.scale.set(1, 0.25, 1);

                    }
                    else {
                        var oldx = this.mesh.position.x;
                        var oldy = this.mesh.position.y;
                        var oldz = this.mesh.position.z;
                        scene.remove(this.mesh);
                        this.mesh = standMesh;
                        scene.add(this.mesh);
                        this.mesh.position.set(oldx, oldy + 7.5, oldz);
                        //this.mesh.scale.set(1, 1, 1);
                    }
                }
            }
        }
        else {
            this.toggleCrouch = false;
        }

        //correct for mouse cursor not being locked.  
        if (!document.pointerLockEnabled) {

            var xRatio = (input.mouseX - canvas.offsetLeft) / canvas.width;

            if (xRatio < 0.2) {
                input.center -= 0.1 * (0.2 - xRatio);
            }

            if (xRatio > 0.8) {
                input.center += 0.1 * (xRatio - 0.8);
            }
            if (input.center < 0) {
                input.center += 2 * Math.PI;
            }
            if (input.center > 2 * Math.PI) {
                input.center -= 2 * Math.PI;
            }
        }


        // Reorient camera
        input.f.z = Math.sin(input.theta) * Math.sin(input.phi + input.center)
        input.f.x = Math.sin(input.theta) * Math.cos(input.phi + input.center);
        input.f.y = Math.cos(input.theta);

        // handle player jump
        if (input.hold === 1) {
            input.Jump = 0;
            if (input.trigger.Jump === 1 && this.crouch === 0) {
                input.Jump = 1;
                input.v = jumpVel;
                input.hold = 0;
                input.v -= 0.4;
                this.mesh.position.y += input.v;
            }
        }
        else {
            input.v -= 0.4;
            this.mesh.position.y += input.v;
        }

        // Update player position relative to the view direction
        var AD = input.trigger.A - input.trigger.D,
            WS = input.trigger.W - input.trigger.S;

        var xzNorm = Math.sqrt(input.f.x * input.f.x + input.f.z * input.f.z);
        this.mesh.position.x +=
           this.currSpd * (WS * input.f.x + AD * input.f.z / xzNorm);
        this.mesh.position.z +=
            this.currSpd * (WS * input.f.z - AD * input.f.x / xzNorm);
        // Update camera position/lookat
        if (this.crouch === 0) {
            this.camera.position.add(this.mesh.position, new THREE.Vector3(0, 9, 0));
        }
        else {
            this.camera.position.add(this.mesh.position, new THREE.Vector3(0, 2.25, 0));
        }

        var look = new THREE.Vector3();
        look.add(this.camera.position, input.f);
        this.camera.lookAt(look);

        return (AD != 0) || (WS != 0);

    }

    this.updateLight = function (inLight, inputVec) {

        if (inLight) {

            //lightTog prevents cycling the light until inLight is released.
            if (!this.lightTog) {
                this.flashlight.onlyShadow = this.lightOn;
                this.lightOn = !this.lightOn;
                this.lightTog = true;
            }
        } else {
            this.lightTog = false;
        }


        if (this.lightOn) {
            var meshPos = this.mesh.position;
            this.flashlight.position.set(meshPos.x, meshPos.y, meshPos.z);
            this.flashlight.target.position.set(
                meshPos.x + inputVec.x,
                meshPos.y + inputVec.y,
                meshPos.z + inputVec.z);
        } else {

        }
    }


}
