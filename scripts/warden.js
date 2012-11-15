function Warden() {
	
	this.mesh = null; 
	this.speed = 2; 
	
	this.init = function( scene ){
		this.mesh = new THREE.Mesh(
			new THREE.CubeGeometry( 10, 10, 10 ),
			new THREE.MeshBasicMaterial( { color: 0xff0000 } ) 
		);
		
		scene.add( this.mesh ); 
		
	}
	
	/*
	 * Basic Follow Player to start
	 * 
	 */
	this.update = function(x, z){
		
		dX = x - this.mesh.position.x; 
		dZ = z - this.mesh.position.z; 
		
		
		var d = Math.sqrt(dX*dX+dZ*dZ);    		
		
		if( d > 30 ){
			
			this.mesh.position.x += (this.speed * ( dX / d ));
	        this.mesh.position.z += (this.speed * ( dZ / d )); 
	            
		}
	}	
	
	
}
