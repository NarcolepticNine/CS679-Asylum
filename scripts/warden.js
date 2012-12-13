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
    this.nextPatrol = 0;
    this.currPatrol = null;
    this.patrols = new Array();

	this.lastTarget	= new THREE.Vector3(); 
	this.Path   	= new Array(); //will be filled with path points to current target
	this.pathPt     = null; 
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
        ry = Math.floor(ry / CELL_SIZE + 0.51);
        var dX = playPos.x - X;
        var dZ = playPos.z - Z;
        var d = Math.sqrt((dX * dX) + (dZ * dZ));

		if (Y != ry) {
	            this.awareness = 0;
	    }
		else {
		     this.checkPlayer(game, input, playerSound, d);
		}	    
	
        if (game.urgent === 4) {
            this.playFinalScream();
            this.caught = true;
            this.game.end = 1;
        }

        if (this.awareness < this.awareThres) {

            if (this.currPatrol == null) {
                this.currPatrol = this.patrols[this.nextPatrol];
                this.nextPatrol = (++this.nextPatrol == this.patrols.length) ? 0 : this.nextPatrol;
            	
            	this.pathfind( this.mesh.position, this.currPatrol );
            	this.pathPt = this.Path.pop();
            }

            //target position
            var pX = this.currPatrol.x;
            var pZ = this.currPatrol.z;
			
			
            if( this.Path.length == 0 ) {
                //select new current point.  
                this.currPatrol = this.patrols[this.nextPatrol];
                this.nextPatrol = (this.pDir) ? this.nextPatrol + 1 : this.nextPatrol - 1;
                this.pDir = (this.nextPatrol == 0 || this.nextPatrol == this.patrols.length - 1) ? !this.pDir : this.pDir;

				//console.log( "New Patrol Point: " + this.currPatrol.x + " " + this.currPatrol.z  );
				this.pathfind( this.mesh.position, this.currPatrol ); 
				this.pathPt = this.Path.pop(); 
            }
            
        } else {
            
            //calculate new path to player if needed
            this.pathfind( this.mesh.position, game.player.mesh.position ); 
        	this.pathPt = this.Path.pop();
        	console.log( this.Path ); 
            //if awareness too high, warden sprints
		    this.currSpd = (this.awareness > this.angerThres) ? (1 + 0.02 * this.awareness) * this.speed : this.speed;
        }
		
		//move towards next path point if available
		if( this.pathPt ){
			
			dX = this.pathPt.x - this.mesh.position.x; 
			dZ = this.pathPt.z - this.mesh.position.z; 
			d = Math.sqrt(dX * dX + dZ * dZ);
			
			this.mesh.position.x += (this.vX = (this.currSpd * (dX / d)));
            this.mesh.position.z += (this.vZ = (this.currSpd * (dZ / d)));
            this.mesh.rotation.y = -Math.atan2(dZ, dX) + Math.PI / 2;
            
            if( d < 10 ) this.pathPt = this.Path.pop(); 
            
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

    /*
     * return array of 2-d points ( initially ) that show a path from current
     * point to the end point 
 	 * 
 	 */
 	this.visitCnt;
    this.pathfind = function (meshPos, targetPos) {
	
		if( targetPos != this.lastTarget ){
			// if targetPos is different that last target position pathfind
			var rx = Math.floor(Math.floor(meshPos.x) / CELL_SIZE + 1 / 2);
	        var rz = Math.floor(Math.floor(meshPos.z) / CELL_SIZE + 1 / 2);
	        var ry = 0; //Math.floor(Math.floor(meshPos.y) / CELL_SIZE);
	
			var tarX = Math.floor(Math.floor(targetPos.x) / CELL_SIZE + 1 / 2);
			var tarZ = Math.floor(Math.floor(targetPos.z) / CELL_SIZE + 1 / 2);
			var tarY = 0; //Math.floor(Math.floor(targetPos.y) / CELL_SIZE);
			
			this.lastTarget = targetPos; 
			
			this.visitCnt = 1; 
			var iterCount = 500; 
			var findQueue = new Array(); 
			var visitedArr = new Array(); 
			var notFound = true; 
			
			// check center, and prime queue
			this.processCell( rx, ry, rz, 0,  findQueue, visitedArr  );
			
			while( notFound && findQueue.length > 0 && ( --iterCount > 0 ) ){
				var curr = findQueue.shift(); 
				
				if( curr.x == tarX && curr.y == tarY && curr.z == tarZ ){
					//found where we need to be, trace back. 
					notFound = false;
					
					//build up and set path 
					this.traceBack( visitedArr, curr ); 
					break;
					
				} else {
					this.processCell( curr.x, curr.y, curr.z, curr.id, findQueue, visitedArr );
				}
			}
		}
		//else, leave this.lastPath alone

        
    }

	
	this.processCell = function( x, y, z, prev, queue, visitedArr ){
		
		var cellArr = this.checkCell( this.game.level.grid[y][z][x] );		
		var vec3; 
		
		if( cellArr['n'] ){
			vec3 = new THREE.Vector3( x, y, z - 1  );
			vec3.id   = this.visitCnt++; 
			vec3.prev = prev;
			visitedArr[ vec3.id ] = vec3;  
			queue.push( vec3 );
			
		}
		if( cellArr['s'] ){
			vec3 = new THREE.Vector3( x, y, z + 1  ); 
			vec3.id   = this.visitCnt++; 
			vec3.prev = prev;
			visitedArr[ vec3.id ] = vec3; 
			queue.push( vec3 );
	
		}
		if( cellArr['w'] ){
			vec3 = new THREE.Vector3( x - 1, y, z );
			vec3.id   = this.visitCnt++; 
			vec3.prev = prev;
			visitedArr[ vec3.id ] = vec3; 
			queue.push( vec3 );
	
		}
		if( cellArr['e'] ){
			vec3 = new THREE.Vector3( x + 1, y, z )
			vec3.id   = this.visitCnt++; 
			vec3.prev = prev;
			visitedArr[ vec3.id ] = vec3; 
			queue.push( vec3 );
	
		}
		
	}

	this.traceBack = function ( visitedArr, end ) {
		
		var curr = end; 
		var path = new Array();
		var pos  = new THREE.Vector3( curr.x * CELL_SIZE, 0, curr.z * CELL_SIZE );
		path.push( pos );  
		
		// when curr.prev = 0, it should be the node 1 away from the current
		// node, which works, as we are already in the current node. 
		while( curr.prev ){ 
			curr = visitedArr[ curr.prev ]; 
			pos  = new THREE.Vector3( curr.x * CELL_SIZE, 0, curr.z * CELL_SIZE );
			path.push( pos ); 		
			
		}
		
		this.Path = path; 
				
	}
	
	//return array of booleans for directions that are possible to go from inputted
	//cell
	this.checkCell = function( cell ){
		//TODO store walls data as a part of the cell
		// ie: cell.walls = ret; 
		//TODO consider doors
		var ret = new Array(); 
		ret['n'] = ret['s'] = ret['w'] = ret['e'] = true; 
		
		var evenPossible = false; 
		
		for (var o = 0; o < cell.length; o++) {
	
			if( cell[o].type.charAt(0) === CELL_TYPES.floor ) {
				evenPossible = true; 
			}
	
	  		if (cell[o].type.charAt(0) === CELL_TYPES.wall) {
	
	     		switch (cell[o].type.charAt(1)) {
	
	                case 'n':
	                case 's':
	                case 'e':
	            	case 'w':
	                	ret[cell[o].type.charAt(1)] = false;
	            		break;
	
	        	}
	    	}
		}
		
		if( evenPossible ){
			return ret;
		} else {
			ret['n'] = ret['s'] = ret['w'] = ret['e'] = false;
			return ret; 
		}
			 
	}
	
}


