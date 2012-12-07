function Warden() {
	
	//Warden Definition
	this.game       = null; 
	this.startPos   = null; 
	this.mesh       = null;
	this.meshURL    = "./obj/demon/demon.js";
	this.textureURL = "./obj/demon/colorMap.png"; 
	this.flashlight = null; 
	
	//Mechanic Variables 
	this.speed   = 0.6; 
	this.currSpd = this.speed;
	
	//general Sound variables - Warden Sounds require nodes for positions. 
	//  Needs research
	//this.soundManager; 
	//this.countAssets = 0; 
	
	
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
		
		this.game 		= game; 
		this.startPos 	= startPos; 
		//TODO Improved Warden Mesh
		
		var warden = this; 
		
		var callback = function ( geometry, scalex, scaley, scalez, tmap ) {
			console.log( "Demon Loaded" ); 
			var tempMesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture("./obj/demon/colorMap.png") }) ); 
			tempMesh.scale.set( scalex, scaley, scalez ); 
			warden.mesh = tempMesh; 
				
		}
        
        var loader = new THREE.JSONLoader(); 
       	loader.load( this.meshURL, function( geometry ){ callback( geometry, 10,10,10, this.textureURL ); } )
        

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
		this.awareness = ( playerSound > d ) ? this.awareness += 5 : this.awareness -= 5 ; 
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
			this.caught = true;
			this.game.end = 1; 
		}  
		
		if( this.awareness < 30 ) {
			
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
			    this.mesh.position.z += ( this.vZ = ( this.currSpd * ( dZ / d )) );	
				 
			}
		 } else {
		 	
		 	//if awareness too high, warden sprints
		 	this.currSpd = ( this.awareness >= 60 ) ? this.speed * 2 : this.speed; 		 	
		 	
		 	this.mesh.position.x += ( this.vX = ( this.currSpd * ( dX / d )) );
			this.mesh.position.z += ( this.vZ = ( this.currSpd * ( dZ / d )) );	
				
		 }	
		 
		 //update light position and direction
		 var meshPos = this.mesh.position; 
		 this.flashlight.position = meshPos; 
		 this.flashlight.target.position.set( 
		 		meshPos.x + this.vX, 
		 		meshPos.y,
		 		meshPos.z + this.vZ 
		 	);
		 
	}
	
	this.updateLoad = function ( posVec, playerSound, lightOn ){
		
		if( this.mesh ){ 
			
			console.log( "Demon Model Ready" ); 
			this.update = this.updateLoaded;
			this.game.scene.add( this.mesh ); 
			this.setStartPos( this.startPos ); 
		
		}
	}

	
	
}
