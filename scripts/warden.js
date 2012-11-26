function Warden() {
	
	this.mesh    = null; 
	this.speed   = 0.6; 
	this.currSpd = this.speed;
	
	//patrol Variables
	this.pDir    = true; //direction of patrol
	this.nextPt  = 0; 
	this.pt      = null; 
	this.patrols = new Array(); 
		
	/*Awareness determines how hard it is to hide from the Warden.  
	 * If the player is heard, or spotted within a certain amount of time,
	 * awareness goes up.  If the player is able to hide, awareness will drop.
	 */
	this.awareness = 0; 
	
	//pass in level.startPos
	this.setStartPos = function ( vec3  ){
		this.mesh.position.set( vec3.x, vec3.y + 8.5, vec3.z ); 	
		
	}
	
	this.init = function( scene, startPos, patrolArr ){
		this.mesh = new THREE.Mesh(
			new THREE.CubeGeometry( 10, 10, 10 ),
			new THREE.MeshLambertMaterial( { color: 0xff0000 } ) 
		);
		
		scene.add( this.mesh ); 
		this.setStartPos( startPos ); 
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
	
	/*
	 * Basic Sound Mechanic.  Player movement causes Player sound to rise.  
	 * Sound is passed as a the player's sound level currently.  
	 */
	this.updateLoaded = function( posVec, playerSound, lightOn ){
		
		//current position.
		var X  = this.mesh.position.x; 
		var Z  = this.mesh.position.z;
		
		var dX = posVec.x - X; 
		var dZ = posVec.z - Z; 
		
		var d = Math.sqrt(dX*dX+dZ*dZ);    		
		
		this.checkPlayer( d, playerSound, lightOn ); 	
		
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
				this.mesh.position.x += (this.currSpd * ( dX / d ));
			    this.mesh.position.z += (this.currSpd * ( dZ / d ));	
				 
			}
		 } else {
		 	//if awareness too high, warden sprints
		 	this.currSpd = ( this.awareness >= 60 ) ? this.speed * 2 : this.speed; 		 	
		 	this.mesh.position.x += (this.currSpd * ( dX / d ));
		    this.mesh.position.z += (this.currSpd * ( dZ / d )); 
		 	
		 }	
	}
	
	this.updateLoad = function ( posVec, playerSound, lightOn ){
		
		if( this.mesh ) this.update = this.updateLoaded; 
		
	}

	
	
}
