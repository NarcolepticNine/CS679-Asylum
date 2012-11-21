function Player() {
	
	//player definition
	this.game   = null;  
	this.mesh   = null; 
	this.input  = null; 
	this.camera = null; 
	this.flashlight = null;
	
	//mechanic variables
	var speed    = 0.6; 
	var jumpVel  =   4;
	this.currSpd = speed; //TODO add sprinting ability by doubling this on holding shift 
	this.sound = 0;
	this.vY = 0;
	
	this.init = function( game, scene, camera, startPos ){
		
		this.camera = camera;
		this.game   = game;  
		
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
		
		this.setStartPos( startPos ); 
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
	
		this.sound = this.updateMovement( input ); 
		this.sound = this.sound * this.currSpd; 
		this.sound = this.sound * 100;  
		
		this.updateViewRay( input ); 
		this.updateLight( input.viewRay.direction ); 
		
	}	
	
	this.updateViewRay = function( input ) {
		var rayVec = new THREE.Vector3(0, 0, 1);
        this.game.projector.unprojectVector(rayVec, this.camera);
        var playPos = this.mesh.position;
        input.viewRay = new THREE.Ray(
            playPos,                             // origin
            rayVec.subSelf(playPos).normalize(), // direction
            0, 1000                                           // near, far
        );		
	}
	
	this.updateMovement = function( input ){
		
		//adjust for running or crouching, or neither: 
		if( input.trigger.run || input.trigger.crouch ){
			
			this.currSpd = ( input.trigger.run ) ? speed * 2 : speed / 2 ; 
			
		} else {
			
			this.currSpd = speed; 
			
		}
		
		//correct for mouse cursor not being locked.  
	    if (!document.pointerLockEnabled) {
	    	
	    	var xRatio = (input.mouseX - canvas.offsetLeft) / canvas.width; 
	    	
	        if ( xRatio < 0.2) {
	            input.center -= 0.1 * (0.2 - xRatio );
	        }
	        
	        if ( xRatio > 0.8) {
	            input.center += 0.1 * ( xRatio - 0.8);
	        }
	    }
	
	
	    // Reorient camera
	    input.f.z = Math.sin(input.theta) * Math.sin(input.phi + input.center)
	    input.f.x = Math.sin(input.theta) * Math.cos(input.phi + input.center);
	    input.f.y = Math.cos(input.theta);
	
		// handle player jump
		if (input.hold === 1) {
	        input.Jump = 0;
	        if (input.trigger.Jump === 1) {
	            input.Jump = 1;
	            input.v = jumpVel;
	            input.trigger.Jump = 0;
	            input.hold = 0;
	            input.v -= 0.4;
	            this.mesh.position.y += input.v;
	        }
	    } else {
	        input.v -= 0.4;
	        this.mesh.position.y += input.v;
	    }

		// Update player position relative to the view direction
		var AD = input.trigger.A - input.trigger.D,
			WS = input.trigger.W - input.trigger.S; 
		
		var xzNorm = Math.sqrt(input.f.x * input.f.x + input.f.z * input.f.z);
    	this.mesh.position.x += 
           this.currSpd * ( WS * input.f.x + AD * input.f.z / xzNorm) ; 
        
        this.mesh.position.z += 
        	this.currSpd * ( WS * input.f.z - AD * input.f.x / xzNorm );

		// Update camera position/lookat 
    	this.camera.position = this.mesh.position;
   	 	var look = new THREE.Vector3();
   	 	look.add(this.camera.position, input.f);
	    this.camera.lookAt(look);
		
		return ( AD + WS != 0 );
		
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