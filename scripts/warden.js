function Warden() {
	
	this.mesh = null; 
	this.speed = 2; 
	
	/*Awareness determines how hard it is to hide from the Warden.  
	 * If the player is heard, or spotted within a certain amount of time,
	 * awareness goes up.  If the player is able to hide, awareness will drop.
	 */
	this.awareness = 0; 
	
	//pass in level.startPos
	this.setStartPos = function ( vec3  ){
		this.mesh.position.set( vec3.x, vec3.y + 8.5, vec3.z ); 	
		
	}
	
	this.init = function( scene, startPos ){
		this.mesh = new THREE.Mesh(
			new THREE.CubeGeometry( 10, 10, 10 ),
			new THREE.MeshLambertMaterial( { color: 0xff0000 } ) 
		);
		
		scene.add( this.mesh ); 
		this.setStartPos( startPos ); 
		
	}
	
	/*
	 * Basic Sound Mechanic.  Player movement causes Player sound to rise.  
	 * Sound is passed as a the player's sound level currently.  '
	 */
	this.update = function( posVec, playerSound ){
		
		dX = posVec.x - this.mesh.position.x; 
		dZ = posVec.z - this.mesh.position.z; 
				
		var d = Math.sqrt(dX*dX+dZ*dZ);    		
		
		this.awareness += 5; 
		if( playerSound < d ){
			this.awareness = ( ( this.awareness - 10 ) < 0 ) ? 0 : this.awareness - 10;   
		}
		this.awareness = ( playerSound > d ) ? this.awareness += 5 : this.awareness -= 5 ; 
			
		if( this.awareness  > 30 ){
			this.mesh.position.x += (this.speed * ( dX / d ));
	        this.mesh.position.z += (this.speed * ( dZ / d )); 
	    }
	}	
	
	
}
