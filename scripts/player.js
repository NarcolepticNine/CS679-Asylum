function Player() {
	
	//player definition 
	this.mesh   = null; 
	this.input  = null; 
	this.camera = null; 
	this.flashlight = null;
	
	//mechanic variables
	this.sound = 0;
	this.vY = 0; 
	 
	this.init = function( scene, camera ){
		
		this.camera = camera; 
		
		this.mesh = new THREE.Mesh(
			new THREE.CubeGeometry(9, 17, 3.5),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 })
		);
		
		this.flashlight = new THREE.SpotLight(0xffffff, 10, 100);
        this.flashlight.castShadow = true; 
        this.flashlight.shadowCameraNear = 0; 
        this.flashlight.shadowCameraFar  = 5; 
        this.flashlight.shadowCameraVisible = true; 
                
		scene.add( this.mesh ); 
		scene.add( this.flashlight ); 
	}
	
	//pass in level.startPos
	this.setStartPos = function ( vec3  ){
		
		var x = vec3.x, y = vec3.y + 8.5, z = vec3.z ; 
		
		this.mesh.position.set( x, y, z ); 
		this.flashlight.position.set( x, y, z );
		this.camera.position.set( x, y, z ); 
		
	}
	
	this.getPosVec = function (){
		return this.mesh.position; 	
	}
	
	this.update = function( input ){
	
		this.sound = 0; 
		    
	}	
	
	this.updateCamera = function( ){
		
	}
	
	this.updateLight  = function( inputVec ) {
		var meshPos = this.mesh.position; 
		this.flashlight.position.set( meshPos.x, meshPos.y, meshPos.z );
		this.flashlight.target.position.set(
			meshPos.x + inputVec.x, 
			meshPos.y + inputVec.y, 
			meshPos.z + inputVec.z ); 
	}
	
	
}