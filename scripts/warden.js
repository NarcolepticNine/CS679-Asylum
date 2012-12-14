function Warden(game) {
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
    this.speed = 0.4 + 0.2 * game.difficulty;
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
    this.notSeen = true;
    this.patrols = new Array();

    this.there = false;
    this.targetPt = new THREE.Vector3();
    this.Path = new Array(); //will be filled with path points to current target
    this.pathPt = null;
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
        var cond = 0;

        if (this.inLineOfSight(game.player.mesh.position.x - this.mesh.position.x, game.player.mesh.position.y - (this.mesh.position.y + 15), game.player.mesh.position.z - this.mesh.position.z) === true) {
            //if in line of sight, use urgency
            this.notSeen = false;
            cond = game.urgent;

        } else {
            this.notSeen = true;
            if (soundAwareness !== -1) {
                //otherwise leave cond = 0, so awareness goes down, and half sound
                //awareness

                soundAwareness = soundAwareness / 2;
            }
        }



        switch (cond) {
            case 0: //very far
                if (soundAwareness === -1) {
                    game.warden.awareness -= 1;
                }
                else {
                    if (game.difficulty === 3) {
                        game.warden.awareness = 100;
                    }
                    else {
                        game.warden.awareness += soundAwareness;
                    }
                }
                break;
            case 1: //closer
                if (game.player.crouch === 1 || game.player.lightOn === false) {
                    if (soundAwareness === -1) {
                        game.warden.awareness -= 1;
                    }
                    else {
                        if (game.difficulty === 3) {
                            game.warden.awareness = 100;
                        }
                        else {
                            game.warden.awareness += soundAwareness;
                        }
                    }
                }
                else {
                    if (game.difficulty === 3) {
                        game.warden.awareness = 100;
                    }
                    else {
                        if (soundAwareness === -1) {
                            game.warden.awareness += 0.1;
                        }
                        else {
                            game.warden.awareness += soundAwareness + 0.1;
                        }
                    }
                }
                break;
            case 2: //closer still
                if (game.player.crouch === 1 && game.player.lightOn === false) {
                    if (soundAwareness === -1) {
                        game.warden.awareness -= 1;
                    }

                    else {
                        if (game.difficulty === 3) {
                            game.warden.awareness = 100;
                        }
                        else {
                            game.warden.awareness += soundAwareness;
                        }
                    }
                }
                else {
                    if (game.difficulty === 3) {
                        game.warden.awareness = 100;
                    }
                    else {
                        if (soundAwareness === -1) {
                            this.awareness += 0.1 * (2 - game.player.crouch) * (1 + game.player.lightOn);
                        }
                        else {
                            game.warden.awareness += 0.1 * (2 - game.player.crouch) * (1 + game.player.lightOn) + soundAwareness;
                        }
                    }
                }
                break;
            case 3: // Too close
                if (game.difficulty === 3) {
                    game.warden.awareness = 100;
                }
                else {
                    if (soundAwareness === -1) {
                        game.warden.awareness += 0.3 * (2 - game.player.crouch) * (1 + game.player.lightOn);
                    }
                    else {
                        game.warden.awareness += 0.3 * (2 - game.player.crouch) * (1 + game.player.lightOn) + soundAwareness;
                    }
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
        var rx = Math.floor(Math.floor(game.player.mesh.position.x) / CELL_SIZE + 1 / 2);
        var rz = Math.floor(Math.floor(game.player.mesh.position.z) / CELL_SIZE + 1 / 2);
        var ry;
        if (game.player.crouch) {
            ry = game.player.mesh.position.y - 2.5;
        }
        else {
            ry = game.player.mesh.position.y - 10;
        }
        if (ry > 0.49 * CELL_SIZE && ry < 0.51 * CELL_SIZE) {
            if (rx < 15) {
                if (rx == 10) {
                    ry = 1;
                }
                else {
                    ry = 0;
                }
            }
            else {
                if (rz === 7) {
                    ry = 1;
                }
                else {
                    ry = 0;
                }
            }
        }
        else {
            ry = Math.floor(ry / CELL_SIZE + 0.5);
        }
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

                this.pathfind(this.mesh.position, this.currPatrol);
                this.pathPt = this.Path.pop();
            }

            //target position
            var pX = this.currPatrol.x;
            var pZ = this.currPatrol.z;


            if (this.there) {
                //select new current point.  
                this.there = false;
                this.currPatrol = this.patrols[this.nextPatrol];
                this.nextPatrol = (this.pDir) ? this.nextPatrol + 1 : this.nextPatrol - 1;
                this.pDir = (this.nextPatrol == 0 || this.nextPatrol == this.patrols.length - 1) ? !this.pDir : this.pDir;

                //console.log( "New Patrol Point: " + this.currPatrol.x + " " + this.currPatrol.z  );
                this.pathfind(this.mesh.position, this.currPatrol);
                this.pathPt = this.Path.pop();
            }
        } else {

            //calculate new path to player if needed
            if (this.pathfind(this.mesh.position, game.player.mesh.position))
                this.pathPt = this.Path.pop();

            //if awareness too high, warden sprints
            this.currSpd = (this.awareness > this.angerThres) ? (1 + 0.02 * this.awareness) * this.speed : this.speed;
        }

        //move towards next path point if available
        if (this.pathPt) {

            dX = this.pathPt.x - this.mesh.position.x;
            dZ = this.pathPt.z - this.mesh.position.z;
            d = Math.sqrt(dX * dX + dZ * dZ);

            this.mesh.position.x += (this.vX = (this.currSpd * (dX / d)));
            this.mesh.position.z += (this.vZ = (this.currSpd * (dZ / d)));
            this.mesh.rotation.y = -Math.atan2(dZ, dX) + Math.PI / 2;

            if (d < 10) {
                this.pathPt = this.Path.pop();
                if (!this.pathPt) this.there = true;
            }
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

        this.keyframe = Math.floor(this.time / this.interpolation);

        if (this.keyframe != this.currentKeyframe) {

            this.mesh.morphTargetInfluences[this.lastKeyframe] = 0;
            this.mesh.morphTargetInfluences[this.currentKeyframe] = 1;
            this.mesh.morphTargetInfluences[this.keyframe] = 0;
            this.lastKeyframe = this.currentKeyframe;
            this.currentKeyframe = this.keyframe;

            //console.log(this.currentKeyframe);

        }

        this.mesh.morphTargetInfluences[this.keyframe] = (this.time % this.interpolation) / this.interpolation;
        this.mesh.morphTargetInfluences[this.lastKeyframe] = 1 - this.mesh.morphTargetInfluences[this.keyframe];
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

        var tarX = Math.floor(Math.floor(targetPos.x) / CELL_SIZE + 1 / 2);
        var tarZ = Math.floor(Math.floor(targetPos.z) / CELL_SIZE + 1 / 2);



        if (this.targetPt.x != tarX || this.targetPt.z != tarZ) {

            // if targetPos is different that last target position pathfind
            var rx = Math.floor(Math.floor(meshPos.x) / CELL_SIZE + 1 / 2);
            var rz = Math.floor(Math.floor(meshPos.z) / CELL_SIZE + 1 / 2);
            var ry = 0; //Math.floor(Math.floor(meshPos.y) / CELL_SIZE);


            var tarY = 0; //Math.floor(Math.floor(targetPos.y) / CELL_SIZE);

            this.targetPt.x = tarX;
            this.targetPt.z = tarZ;

            this.visitCnt = 1;
            var iterCount = 1000;
            var findQueue = new Array();
            var visitedArr = new Array();
            var visitedGrid = new Array();

            var markVisit = function (x, y, z) {

                if (visitedGrid[x]) {
                    visitedGrid[x][z] = true;
                } else {
                    visitedGrid[x] = new Array();
                    visitedGrid[x][z] = true;
                }

            }

            var notFound = true;

            // check center, and prime queue
            this.processCell(rx, ry, rz, 0, findQueue, visitedArr);

            while (notFound && findQueue.length > 0 && (--iterCount > 0)) {
                var curr = findQueue.shift();

                if (curr.x == tarX && curr.z == tarZ) {
                    //found where we need to be, trace back. 
                    notFound = false;

                    //build up and set path 
                    this.traceBack(targetPos, visitedArr, curr);
                    return true;


                } else if (!(visitedGrid[curr.x] && visitedGrid[curr.x][curr.z])) {
                    markVisit(curr.x, 0, curr.z);
                    this.processCell(curr.x, curr.y, curr.z, curr.id, findQueue, visitedArr);
                }
            }


        }
        //else, leave this.lastPath alone

        return false;

    }


    this.processCell = function (x, y, z, prev, queue, visitedArr) {

        var cellArr = this.checkCell( this.game, x, y, z);
        var vec3;

        if (cellArr['n']) {
            vec3 = new THREE.Vector3(x, y, z - 1);
            vec3.id = this.visitCnt++;
            vec3.prev = prev;
            visitedArr[vec3.id] = vec3;
            queue.push(vec3);

        }
        if (cellArr['s']) {
            vec3 = new THREE.Vector3(x, y, z + 1);
            vec3.id = this.visitCnt++;
            vec3.prev = prev;
            visitedArr[vec3.id] = vec3;
            queue.push(vec3);

        }
        if (cellArr['w']) {
            vec3 = new THREE.Vector3(x - 1, y, z);
            vec3.id = this.visitCnt++;
            vec3.prev = prev;
            visitedArr[vec3.id] = vec3;
            queue.push(vec3);

        }
        if (cellArr['e']) {
            vec3 = new THREE.Vector3(x + 1, y, z)
            vec3.id = this.visitCnt++;
            vec3.prev = prev;
            visitedArr[vec3.id] = vec3;
            queue.push(vec3);

        }

    }

    this.traceBack = function (targetPos, visitedArr, end) {

		this.Path = [];
        var curr = end;
        var pos = targetPos;
        this.Path.push(pos);

        // when curr.prev = 0, it should be the node 1 away from the current
        // node, which works, as we are already in the current node. 
        while (curr.prev) {
            curr = visitedArr[curr.prev];
            pos = new THREE.Vector3(curr.x * CELL_SIZE, 0, curr.z * CELL_SIZE);
            this.Path.push(pos);

        }

    }

	

    //return array of booleans for directions that are possible to go from inputted
    //cell
    this.checkCell = function (game, x, y, z) {
        
        //used to build wall directions and store as an array
        var setWallArray = function( cell ){
			
			var wallArray = new Array(); 
			var floor = false; 
			wallArray['n'] = wallArray['s'] = wallArray['w'] = wallArray['e'] = false;
			
			for (var o = 0; o < cell.length; o++) {
				
				switch( cell[o].type.charAt(0) ){
				
						case CELL_TYPES.floor:
							floor = true;
							break; 
					
						case CELL_TYPES.door:
								switch( cell[o].type.charAt(1) ){
									
									case 's':
									case '1':
										wallArray['s'] = true;
										break;
									
									case 'n':
									case '3':
										wallArray['n'] = true;
										break;	
									
									case 'w':	
									case '2':
									case 'z':
										wallArray['w'] = true;
										break;
									
									case 'e':
									case 'q':
									case '4':
										wallArray['e'] = true;
										break;
								}  
								
							break; 
						case CELL_TYPES.wall:
							wallArray[cell[o].type.charAt(1)] = true;
							break;
					} 
			}
			
			if( floor ){
				cell.walls = wallArray;
			} else {
				wallArray['n'] = wallArray['s'] = wallArray['w'] = wallArray['e'] = true;
				cell.walls = wallArray; 
			}
			
			 
		}
        
        
        
      
        var cell = game.level.grid[y][z][x]; 
        var ret = new Array();
        ret['n'] = ret['s'] = ret['w'] = ret['e'] = true;
        
        if( !cell.walls ) setWallArray( cell ); 
        
        var nextCellCheck = function( x, y, z, dir){
        	
        	var temp = game.level.grid[y][z][x]; 
        	
        	if( !temp.walls ) setWallArray( temp ); 
        	
        	return temp.walls[dir]; 
        	
        }
                      
        ret['n'] = !( cell.walls['n'] || nextCellCheck( x, y, z - 1, 's' ) );
        ret['s'] = !( cell.walls['s'] || nextCellCheck( x, y, z + 1, 'n' ) );
        ret['w'] = !( cell.walls['w'] || nextCellCheck( x - 1, y, z, 'e' ) );
        ret['e'] = !( cell.walls['e'] || nextCellCheck( x + 1, y, z, 'w' ) );
       
        return ret;
       
    }

    this.inLineOfSight = function (dX, dY, dZ) {
        var directionVector = new THREE.Vector3(dX, dY, dZ);
        var begin = new THREE.Vector3();
        begin.add(this.mesh.position, new THREE.Vector3(0, 15, 0));
        var ray = new THREE.Ray(begin,
                directionVector.clone().normalize());
        var collisionResults = ray.intersectObjects(this.game.scene.children);
        if (collisionResults.length > 0) {
            var selected = collisionResults[0].object;
            if (selected.name === 'player') {
                //player is in line of sight
                return true;
            }
        }
        return false;
    }
}
