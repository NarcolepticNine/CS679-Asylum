function Player() {
	
	this.mesh  = null; 
	this.sound = 0;
	 
	this.init = function( scene ){
		this.mesh = new THREE.Mesh(
			new THREE.CubeGeometry(9, 17, 3.5),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 })
		);
		
		scene.add( this.mesh ); 
		
	}
	
	//pass in level.startPos
	this.setStartPos = function ( vec3  ){
		this.mesh.position.set( vec3.x, vec3.y + 8.5, vec3.z ); 	
		
	}
	
	this.getPosVec = function (){
		return this.mesh.position; 	
	}
	
	this.update = function(x, z, sound){
	
		this.sound = 0; 
	
	    }
	}	
	
	
}