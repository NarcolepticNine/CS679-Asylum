function Warden() {
	
	this.mesh = null; 
	this.speed = 2; 
	
	/*Awareness determines how hard it is to hide from the Warden.  
	 * If the player is heard, or spotted within a certain amount of time,
	 * awareness goes up.  If the player is able to hide, awareness will drop.
	 */
	this.awareness = 0; 
	
	this.init = function( scene ){
		this.mesh = new THREE.Mesh(
			new THREE.CubeGeometry( 10, 10, 10 ),
			new THREE.MeshBasicMaterial( { color: 0xff0000 } ) 
		);
		
		scene.add( this.mesh ); 
		
	}
	
	/*
	 * Basic Sound Mechanic.  Player movement causes Player sound to rise.  
	 * Sound is passed as a the player's sound level currently.  '
	 */
	this.update = function(x, z, sound){
		
		dX = x - this.mesh.position.x; 
		dZ = z - this.mesh.position.z; 
				
		var d = Math.sqrt(dX*dX+dZ*dZ);    		
		
		awareness = ( sound > d ) ? awareness +=5 : awareness -= 5 ; 
			
		if( awareness > 30 ){
			this.mesh.position.x += (this.speed * ( dX / d ));
	        this.mesh.position.z += (this.speed * ( dZ / d )); 
	    }
	}	
	
	
}
