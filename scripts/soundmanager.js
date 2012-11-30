function SoundManager(){
	
	var context; //there can only be one audio context
	this.buffers = new Array(); 
	
	this.init = function() {
		
		if (typeof AudioContext == "function") {
			console.log( "Straight Up Audio " ); 
		    context = new AudioContext();
		    window.soundBuffers = this.buffers; 
		} else if (typeof webkitAudioContext == "function") {
		    console.log( "WebKit Audio ");
		    context = new webkitAudioContext();
		    window.soundBuffers = this.buffers; 
		} else {
		    throw new Error('AudioContext not ');
		}
		
	}
	
	
	this.loadSound = function (url) {
	  	var request = new XMLHttpRequest();
	  	request.open('GET', url, true);
	  	request.responseType = 'arraybuffer';
	  	request.url = url;
	  	request.context = context;  
	
	  	// Decode asynchronously
	  	request.onload = function() {
	  		
	  		var callback = function ( buffer ) {
	  			console.log( "Loaded Sound: " + url ); 
	  			window.soundBuffers[ url ] = buffer;
	  		}
	  		
	  		var onError = function () {
	  			console.log( "Blast and Hellfire, something went wrong with loading a sound." ); 
	  		}
	  		
	    	request.context.decodeAudioData( request.response, callback, onError);
	  	}
	  	request.send();
	}
	
	this.playSound = function ( buffer, time ) {
		
		var source = context.createBufferSource();
    	source.buffer = buffer;
    	source.connect(context.destination);
    	source.noteOn(time);		
	
	}
	
	this.returnBuffer = function ( url ) {
		var buffer;
		if( ( buffer = this.buffers[ url ] ) ){
			return buffer;  
		} else {
			return false; 
		}
			
	}
	
	
	this.returnSource = function ( url ) {
		var buffer
		if( ( buffer = this.buffers[ url ] ) ){
			var source = context.createBufferSource();
			source.buffer = buffer;
			source.connect( context.destination );
			return source; 
		} else {
			return false; 
		}
	}
	
	
}
