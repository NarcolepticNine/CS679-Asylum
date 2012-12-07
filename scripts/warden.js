function Warden() {
	
	//Warden Definition
	this.game       = null; 
	this.startPos   = null; 
	this.mesh       = null;
	this.meshURL    = "./obj/demon/demon.js";
	this.textureURL = "./obj/demon/colorMap.png"; 
	this.flashlight = null; 
	
	//Mechanic Variables 
	this.speed      = 0.6; 
	this.currSpd    = this.speed;
	this.awareThres = 30; 
	this.angerThres = 60; 
	
	//general Sound variables - Warden Sounds require nodes for positions. 
	//  Needs research
	this.soundManager; 
	this.countAssets = 8; 
	this.lastVoice   = 0;
	this.timeout = 0; 
	this.lastSource  = null; //used to cut off a scream if changing to loseScream.mp3 
	
	//screams played on random interval greater than 5 seconds while warden is
	// agrivated
	this.screams     = new Array();
	this.screams[0]  = "./sounds/scream1.mp3";
	this.screams[1]  = "./sounds/scream2.mp3";
	this.screams[2]  = "./sounds/scream3.mp3";
	this.screams[3]  = "./sounds/scream4.mp3";
	
	//growls played randomly while walking
	this.growls      = new Array();
	this.growls[0]    = "./sounds/growl1.mp3";
	this.growls[1]    = "./sounds/moan1.mp3";
	this.growls[2]    = "./sounds/moan2.mp3"; 
	 
	//played upon catching the player.   
	this.finalscream = "./sounds/loseScream.mp3";
	
	//patrol Variables
	this.vX 	 = 0;
	this.vZ      = 0;  
	this.pDir    = true; //direction of patrol
	this.nextPt  = 0; 
	this.pt      = null; 
	this.patrols = new Array(); 
		
	/*Awareness determines how hard it is to hide from the Warden.  
	 * If the player is heard, or spotted within a certain amount of time,
	 * awareness goes up.  If the player is able to hide, awareness will drop.
	 */
	this.awareness = 0; 
	
	//Game Variables
	this.caught = false; 
	
	
	//pass in level.startPos
	this.setStartPos = function ( vec3  ){
		this.mesh.position.set( vec3.x, vec3.y, vec3.z ); 	
		
	}
	
	this.init = function( scene, startPos, patrolArr, game ){
		
		this.game 		  = game; 
		this.soundManager = game.soundManager; 
		this.startPos 	  = startPos; 
				
		var warden = this; 
		
		var callback = function ( geometry, scalex, scaley, scalez, tmap ) {
			console.log( "Demon Loaded" ); 
			var tempMesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture("./obj/demon/colorMap.png") }) ); 
			tempMesh.scale.set( scalex, scaley, scalez ); 
			warden.mesh = tempMesh; 
				
		}
        
        var loader = new THREE.JSONLoader(); 
       	loader.load( this.meshURL, function( geometry ){ callback( geometry, 10,10,10, this.textureURL ); } )
        
        //load warden sounds:
        
        for( var i = 0; i < this.growls.length; i ++ )
			this.soundManager.loadSound( this.growls[i]);
			
		for( var i = 0; i < this.screams.length; i ++ )
			this.soundManager.loadSound( this.screams[i]); 
		
		this.soundManager.loadSound( this.finalscream );
		 
       //Warden Flashlight
		this.flashlight = new THREE.SpotLight(0xfffed9, 5, 50);
        this.flashlight.castShadow = true;
        this.flashlight.shadowCameraNear = 0;
        this.flashlight.shadowCameraFar = 5;
        this.flashlight.shadowCameraVisible = true;
		scene.add( this.flashlight ); 
		
		//Warden Patrol points
		this.patrols = patrolArr; 
	
	
	
		console.log( "Patrol Points: ");
		for( var i = 0; i < this.patrols.length ; i++ ){
			console.log( this.patrols[i].x + " " + this.patrols[i].z );
		}
	
		//basic update function that idles until mesh is loaded ( eventually ); 
		this.update  = this.updateLoad; 
	
	}

	this.checkPlayer = function ( d, playerSound, lightOn ){
		
		playerSound = ( lightOn ) ? playerSound * 2 : playerSound ;		
		this.awareness = ( playerSound > d ) ? this.awareness += 1 : this.awareness -= 1 ; 
		this.awareness = ( this.awareness < 0 ) ? 0 : ( ( this.awareness > 100 ) ? 100 : this.awareness ); 		
	} 
	
	this.updateLoaded = function( posVec, playerSound, lightOn ){
		
		//current position.
		var X  = this.mesh.position.x; 
		var Z  = this.mesh.position.z;
		var Y  = this.mesh.position.y; 
		
		var dX = posVec.x - X; 
		var dZ = posVec.z - Z; 
		
		var d = Math.sqrt(dX*dX+dZ*dZ);    		
		
		this.checkPlayer( d, playerSound, lightOn ); 	
		
		if( d < 10 && ( Y >= posVec.y - 10 && Y <= posVec.y + 10 ) ){
			this.playFinalScream(); 
			this.caught = true;
			this.game.end = 1; 
		}  
		
		if( this.awareness < this.awareThres ) {
			
			if( this.pt == null ){
				this.pt = this.patrols[ this.nextPt ];
				this.nextPt = ( ++this.nextPt == this.patrols.length ) ? 0 : this.nextPt;  
			}
			
			//target position
			var pX = this.pt.x; 
			var pZ = this.pt.z; 
			
			dX = pX - X; 
			dZ = pZ - Z; 
			d = Math.sqrt(dX*dX+dZ*dZ);
			
			if( d < 10 ){
				//select new current point.  
				this.pt = this.patrols[ this.nextPt ];
				this.nextPt = ( this.pDir ) ? this.nextPt + 1 : this.nextPt - 1 ;  
				this.pDir = ( this.nextPt == 0 || this.nextPt == this.patrols.length - 1 ) ? !this.pDir : this.pDir; 
				
			} else {
				//keep going towards current point
				this.mesh.position.x += ( this.vX = ( this.currSpd * ( dX / d )) );
				this.mesh.position.z += (this.vZ = (this.currSpd * (dZ / d)));
				this.mesh.rotation.y = -Math.atan2(dZ, dX) + Math.PI / 2;
				 
			}
		 } else {
		 	
		 	//if awareness too high, warden sprints
		 	this.currSpd = ( this.awareness >= this.angerThres ) ? this.speed * 0.5 : this.speed * 0.4; 		 	
		 	this.mesh.position.x += ( this.vX = ( this.currSpd * ( dX / d )) );
		 	this.mesh.position.z += (this.vZ = (this.currSpd * (dZ / d)));
		 	this.mesh.rotation.y = -Math.atan2(dZ, dX) + Math.PI / 2;				
		 }	
		 
		 //update light position and direction
		 var meshPos = this.mesh.position; 
		 this.flashlight.position = meshPos; 
		 this.flashlight.target.position.set( 
		 		meshPos.x + this.vX, 
		 		meshPos.y,
		 		meshPos.z + this.vZ 
		 	);
		 
		 this.playSounds(); 
		 
	}
	
	this.updateLoad = function ( posVec, playerSound, lightOn ){
		
		if( this.mesh ){ 
			
			console.log( "Demon Model Ready" ); 
			this.update = this.updateLoaded;
			this.game.scene.add( this.mesh ); 
			this.setStartPos( this.startPos ); 
		
		}
	}

	this.playFinalScream = function(){
		
		if( typeof this.finalscream != "string" ){
			
			console.log( "Final Scream "); 
			//mute last scream if any
			this.lastSource.disconnect(0); 
			this.soundManager.playSound( this.finalscream, 0 ); 
			
		}
		
	}

	this.soundLoaded = function(  ){
		var start = new Date().getTime();
		
		if( this.awareness < this.awareThres ){
			//growl
			if( start - this.lastVoice > this.timeout ){
				var growl = Math.floor( Math.random() * this.growls.length ); 
				this.lastSource = this.soundManager.playSound( this.growls[ growl ], 0 ); 
				this.lastVoice  = start; 
				this.timeout    = 10000 + ( 20000 * Math.random() );
			}
		
		} else {
			//scream
			if( this.timeout > 20000 ) this.timeout = 5000 + ( 10000 * Math.random() );
			
			if( start - this.lastVoice > this.timeout ){
				var scream = Math.floor( Math.random() * this.screams.length ); 
				this.lastSource = this.soundManager.playSound( this.screams[scream], 0 ); 
				this.lastVoice  = start; 
				this.timeout    = 5000 + ( 3000 * Math.random() );
			}
			
		}
	}

	this.soundLoad  = function(  ) {
		
		var loadHelper = function( player, soundmanager, variable ){
			var tempBuff; 
			
			if( ( tempBuff = soundmanager.returnBuffer( variable ) ) ){
				console.log( "Warden Sound Ready: " + variable + " CountAssets: " + player.countAssets );
				variable = tempBuff; 
				player.countAssets--; 
			}
			
			return variable;	
		}
		
		//TODO add footsteps
		//foreach growl, scream
		for( var i = 0; i < this.growls.length; i ++ )
			this.growls[i] = loadHelper( this, this.soundManager, this.growls[i] ); 
		
		for( var i = 0; i < this.screams.length; i ++ )
			this.screams[i] = loadHelper( this, this.soundManager, this.screams[i] ); 
		
		this.finalscream = loadHelper( this, this.soundManager, this.finalscream ); 
						
		if( this.countAssets == 0 ) {
			console.log( "All Loaded, switching to playing sounds" );
			this.playSounds = this.soundLoaded; 
			return true; 	
		}else {
			return false; 
		}	
	}
	
	//playSounds is a meta function, first it points out soundLoad, then after
	//  soundLoad has done its thing, it switches to soundLoaded, which has the
	//  code to play the sounds.   
	this.playSounds = this.soundLoad; 
	
	
	
}
