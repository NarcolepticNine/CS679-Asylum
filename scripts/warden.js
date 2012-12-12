function Warden() {
    //Warden Definition
    this.game = null;
    this.startPos = null;
    this.mesh = null;
    this.meshURL = "./obj/demon/demonAnim.js";
    this.textureURL = "./obj/demon/colorMap.png";
    this.flashlight1 = null;
    
    //Animation Variables
	this.duration = 1500;
	this.keyframes = 23;
	this.interpolation = this.duration / this.keyframes;
	this.lastKeyframe = 0;
	this.currentKeyframe = 0;

    //Mechanic Variables 
    this.speed = 0.6;
    this.currSpd = this.speed;
    this.awareThres = 20;
    this.angerThres = 50;
    this.ratio = 0;

    //general Sound variables - Warden Sounds require nodes for positions. 
    //  Needs research
    this.soundManager;
    this.countAssets = 8;
    this.lastVoice = 0;
    this.timeout = 0;
    this.lastSource = null; //used to cut off a scream if changing to loseScream.mp3 

    //screams played on random interval greater than 5 seconds while warden is
    // agrivated
    this.screams = new Array();
    this.screams[0] = "./sounds/scream1.mp3";
    this.screams[1] = "./sounds/scream2.mp3";
    this.screams[2] = "./sounds/scream3.mp3";
    this.screams[3] = "./sounds/scream4.mp3";

    //growls played randomly while walking
    this.growls = new Array();
    this.growls[0] = "./sounds/growl1.mp3";
    this.growls[1] = "./sounds/moan1.mp3";
    this.growls[2] = "./sounds/moan2.mp3";

    //played upon catching the player.   
    this.finalscream = "./sounds/loseScream.mp3";

    //patrol Variables
    this.vX = 0;
    this.vZ = 0;
    this.pDir = true; //direction of patrol
    this.nextPt = 0;
    this.pt = null;
    this.patrols = new Array();

    /*Awareness determines how hard it is to hide from the Warden.  
	 * If the player is heard, or spotted within a certain amount of time,
	 * awareness goes up.  If the player is able to hide, awareness will drop.
	 */
    this.awareness = 0;

    //Game Variables
    this.caught = false;


    //pass in level.startPos
    this.setStartPos = function (vec3) {
        this.mesh.position.set(vec3.x, vec3.y, vec3.z);

    }

    this.init = function (scene, startPos, patrolArr, game) {

        this.game = game;
        this.soundManager = game.soundManager;
        this.startPos = startPos;
        this.ratio = 0;

        var warden = this;

        var callback = function (geometry, scalex, scaley, scalez, tmap) {
            console.log("Demon Loaded");
            var tempMesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture("./obj/demon/colorMap.png"), morphTargets: true }));
            tempMesh.scale.set(scalex, scaley, scalez);
            warden.mesh = tempMesh;

        }

        var loader = new THREE.JSONLoader();
        loader.load(this.meshURL, function (geometry) { callback(geometry, 10, 10, 10, this.textureURL); })

        //load warden sounds:

        for (var i = 0; i < this.growls.length; i++)
            this.soundManager.loadSound(this.growls[i]);

        for (var i = 0; i < this.screams.length; i++)
            this.soundManager.loadSound(this.screams[i]);

        this.soundManager.loadSound(this.finalscream);

        //Warden Flashlight
        this.flashlight1 = new THREE.SpotLight(0xffffff, 5, 50, Math.PI / 2, 10);
        this.flashlight2 = new THREE.SpotLight(0xffffff, 5, 100, Math.PI / 2, 10);
        this.flashlight3 = new THREE.PointLight(0xffffff, 5, 10);
        scene.add(this.flashlight1);
        scene.add(this.flashlight2);
        scene.add(this.flashlight3);

        //Warden Patrol points
        this.patrols = patrolArr;

        console.log("Patrol Points: ");
        for (var i = 0; i < this.patrols.length ; i++) {
            console.log(this.patrols[i].x + " " + this.patrols[i].z);
        }

        //basic update function that idles until mesh is loaded ( eventually ); 
        this.update = this.updateLoad;
    }

    this.checkPlayer = function (game, input, playerSound, d) {

        //sound awareness
        var soundAwareness = (d < 5 * CELL_SIZE && game.player.crouch === 0) ? (input.run ? 5 * (CELL_SIZE / d) : 2.5 * (CELL_SIZE / d)) : -1;
        //light awareness
        switch (game.urgent) {
            case 0: //very far
                if (soundAwareness === -1) {
                    game.warden.awareness -= 1;
                }
                else {
                    game.warden.awareness += soundAwareness;
                }
                break;
            case 1: //closer
                if (game.player.crouch === 1 || game.player.lightOn === false) {
                    if (soundAwareness === -1) {
                        game.warden.awareness -= 1;
                    }
                    else {
                        game.warden.awareness += soundAwareness;
                    }
                }
                else {
                    if (soundAwareness === -1) {
                        game.warden.awareness += 0.1;
                    }
                    else {
                        game.warden.awareness += soundAwareness + 0.1;
                    }
                }
                break;
            case 2: //closer still
                if (game.player.crouch === 1 && game.player.lightOn === false) {
                    if (soundAwareness === -1) {
                        game.warden.awareness -= 1;
                    }
                    else {
                        game.warden.awareness += soundAwareness;
                    }
                }
                else {
                    if (soundAwareness === -1) {
                        this.awareness += 0.1 * (2 - game.player.crouch) * (1 + game.player.lightOn);
                    }
                    else {
                        game.warden.awareness += 0.1 * (2 - game.player.crouch) * (1 + game.player.lightOn) + soundAwareness;
                    }
                }
                break;
            case 3: // Too close
                if (soundAwareness === -1) {
                    game.warden.awareness += 0.3 * (2 - game.player.crouch) * (1 + game.player.lightOn);
                }
                else {
                    game.warden.awareness += 0.3 * (2 - game.player.crouch) * (1 + game.player.lightOn) + soundAwareness;
                }
                break;
        }

        this.awareness = (this.awareness < 0) ? 0 : ((this.awareness > 100) ? 100 : this.awareness);
    }

    this.updateLoaded = function (game, input, playPos, playerSound) {
        if (game.gindex === 0) {
            return;
        }

        //current position.
        var X = this.mesh.position.x;
        var Z = this.mesh.position.z;
        var Y = Math.floor(Math.floor(this.mesh.position.y) / CELL_SIZE);
        var ry;
        if (game.player.crouch) {
            ry = game.player.mesh.position.y - 2.5;
        }
        else {
            ry = game.player.mesh.position.y - 10;
        }
        ry = Math.floor(ry / CELL_SIZE + 1 / 2);
        if (Y != ry) {
            this.awareness = 0;
        }
        var dX = playPos.x - X;
        var dZ = playPos.z - Z;
        var d = Math.sqrt((dX * dX) + (dZ * dZ));


        this.checkPlayer(game, input, playerSound, d);

        if (game.urgent === 4) {
            this.playFinalScream();
            this.caught = true;
            this.game.end = 1;
        }

        if (this.awareness < this.awareThres) {

            if (this.pt == null) {
                this.pt = this.patrols[this.nextPt];
                this.nextPt = (++this.nextPt == this.patrols.length) ? 0 : this.nextPt;
            }

            //target position
            var pX = this.pt.x;
            var pZ = this.pt.z;

            dX = pX - X;
            dZ = pZ - Z;
            d = Math.sqrt(dX * dX + dZ * dZ);

            if (d < 10) {
                //select new current point.  
                this.pt = this.patrols[this.nextPt];
                this.nextPt = (this.pDir) ? this.nextPt + 1 : this.nextPt - 1;
                this.pDir = (this.nextPt == 0 || this.nextPt == this.patrols.length - 1) ? !this.pDir : this.pDir;

            } else {
                //keep going towards current point
                this.mesh.position.x += (this.vX = (this.currSpd * (dX / d)));
                this.mesh.position.z += (this.vZ = (this.currSpd * (dZ / d)));
                this.mesh.rotation.y = -Math.atan2(dZ, dX) + Math.PI / 2;

            }
        } else {
            dX = game.player.mesh.position.x - this.mesh.position.x;
            dZ = game.player.mesh.position.z - this.mesh.position.z;
            d = Math.sqrt(dX * dX + dZ * dZ);

            //if awareness too high, warden sprints

            this.currSpd = (this.awareness > this.angerThres) ? (1 + 0.02 * this.awareness) * this.speed : this.speed;

            this.mesh.position.x += (this.vX = (this.currSpd * (dX / d)));
            this.mesh.position.z += (this.vZ = (this.currSpd * (dZ / d)));
            this.mesh.rotation.y = -Math.atan2(dZ, dX) + Math.PI / 2;
        }

        //update light position and direction
        var meshPos = this.mesh.position;
        this.flashlight1.position.set(meshPos.x, meshPos.y + 15, meshPos.z);
        this.flashlight1.target.position.set(
               meshPos.x + this.vX / this.currSpd * 5,
               meshPos.y + 15 - 8,
               meshPos.z + this.vZ / this.currSpd * 5
           );
        this.flashlight2.position.set(meshPos.x, meshPos.y + 15, meshPos.z);
        this.flashlight2.target.position.set(
               meshPos.x + this.vX / this.currSpd * 5,
               meshPos.y + 15 - 3.6,
               meshPos.z + this.vZ / this.currSpd * 5
           );
        this.flashlight3.position.set(
                meshPos.x + this.vX / this.currSpd * 5,
                meshPos.y + 20,
                meshPos.z + this.vZ / this.currSpd * 5
            );
        this.playSounds();
        
    	
	
		this.time = Date.now() % this.duration;
	
		this.keyframe = Math.floor( this.time / this.interpolation );
	
		if ( this.keyframe != this.currentKeyframe ) {
	
			this.mesh.morphTargetInfluences[ this.lastKeyframe ] = 0;
			this.mesh.morphTargetInfluences[ this.currentKeyframe ] = 1;
			this.mesh.morphTargetInfluences[ this.keyframe ] = 0;
	
			this.lastKeyframe = this.currentKeyframe;
			this.currentKeyframe = this.keyframe;
			
			//console.log(this.currentKeyframe);
	
		}
	
		this.mesh.morphTargetInfluences[ this.keyframe ] = ( this.time % this.interpolation ) / this.interpolation;
		this.mesh.morphTargetInfluences[ this.lastKeyframe ] = 1 - this.mesh.morphTargetInfluences[ this.keyframe ];
    }

    this.updateLoad = function (game, input) {

        if (this.mesh) {

            console.log("Demon Model Ready");
            this.update = this.updateLoaded;
            this.game.scene.add(this.mesh);
            this.setStartPos(this.startPos);

        }
    }

    this.playFinalScream = function () {

        if (typeof this.finalscream != "string") {

            console.log("Final Scream ");
            //mute last scream if any
            this.lastSource.disconnect(0);
            this.soundManager.playSound(this.finalscream, 0);

        }

    }

    this.soundLoaded = function () {
        var start = new Date().getTime();

        if (this.awareness < this.awareThres) {
            //growl
            if (start - this.lastVoice > this.timeout) {
                var growl = Math.floor(Math.random() * this.growls.length);
                this.lastSource = this.soundManager.playSound(this.growls[growl], 0);
                this.lastVoice = start;
                this.timeout = 10000 + (20000 * Math.random());
            }

        } else {
            //scream
            if (this.timeout > 20000) this.timeout = 5000 + (10000 * Math.random());

            if (start - this.lastVoice > this.timeout) {
                var scream = Math.floor(Math.random() * this.screams.length);
                this.lastSource = this.soundManager.playSound(this.screams[scream], 0);
                this.lastVoice = start;
                this.timeout = 5000 + (3000 * Math.random());
            }

        }
    }

    this.soundLoad = function () {

        var loadHelper = function (player, soundmanager, variable) {
            var tempBuff;

            if ((tempBuff = soundmanager.returnBuffer(variable))) {
                console.log("Warden Sound Ready: " + variable + " CountAssets: " + player.countAssets);
                variable = tempBuff;
                player.countAssets--;
            }

            return variable;
        }

        //TODO add footsteps
        //foreach growl, scream
        for (var i = 0; i < this.growls.length; i++)
            this.growls[i] = loadHelper(this, this.soundManager, this.growls[i]);

        for (var i = 0; i < this.screams.length; i++)
            this.screams[i] = loadHelper(this, this.soundManager, this.screams[i]);

        this.finalscream = loadHelper(this, this.soundManager, this.finalscream);

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

    /* meshPos is a short hand for the warden's mesh
 * targetPos is either the player's position, or a patrol position.
 */
    this.pathfind = function (meshPos, targetPos) {
        var rx = Math.floor(Math.floor(meshPos.x) / CELL_SIZE + 1 / 2);
        var rz = Math.floor(Math.floor(meshPos.z) / CELL_SIZE + 1 / 2);
        var ry = Math.floor(Math.floor(meshPos.y) / CELL_SIZE);


        var levelGrid = this.game.level.grid[ry];

        var direction = new Array();
        for (var i = 0; i < 3; i++) direction[i] = new Array();
        var center = null;
        var centerWalls = new Array();

        for (var i = 0; i < 3 ; i++) {

            for (var j = 0; j < 3; j++) {
                var cell = levelGrid[rz + (j - 1)][rx + (i - 1)];
                if (i == 1 && j == 1) {
                    center = cell;
                } else {

                    for (var o = 0; o < cell.length; o++) {

                        if (cell[o].type.charAt(0) === CELL_TYPES.wall) {

                            switch (cell[o].type.charAt(1)) {

                                //for any direction, set the variable to false for 
                                // the outer cells
                                case 'n':
                                case 's':
                                case 'e':
                                case 'w':
                                    direction[i][j] = true;
                                    break;

                            }
                        }
                    }
                }
            }
        }

        //check center
        for (var o = 0; o < center.length; o++) {

            if (center[o].type.charAt(0) === CELL_TYPES.wall) {

                switch (center[o].type.charAt(1)) {

                    case 'n':
                    case 's':
                    case 'e':
                    case 'w':
                        centerWalls[center[o].type.charAt(1)] = true;
                        break;

                }
            }
        }

        //determine which direction based on target direction. 
        var ret = new THREE.Vector2();
        ret.x = meshPos.x, ret.z = meshPos.z;
        /*
        if( targetPos.x > meshPos.x ) {
            
            
            ret.x = ( rx + 1 ) * CELL_SIZE ; 
            
            
        } else if ( targetPos.x < meshPos.x ){
            
            
            ret.x = ( rx - 1 ) * CELL_SIZE ;
            
             
        } else{
            
            ret.x = targetPos.x;
             
        }
            */

        //return ret;
        return targetPos;
    }
}
