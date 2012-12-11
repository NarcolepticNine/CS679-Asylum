function Game(renderer, canvas) {
    // ------------------------------------------------------------------------
    // Public properties ------------------------------------------------------
    // ------------------------------------------------------------------------
    this.projector = new THREE.Projector();
    this.renderer = renderer;
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.objects = null;
    this.models = null;
    this.level = null;
    this.lights = null;
    this.skybox = null;
    this.player = null;
    this.oldplayer = null;
    this.initialized = false;
    this.soundManager = null;
    this.collisionSet = null;
    this.warden = null;
    this.old = null;
    this.key = 0;
    this.end = 0;
    this.nextGoal = null;
    this.gindex = 0;
    this.numCheck = 0;
    this.modelNum = null;
    this.again = false;
    this.box = 0;
    this.urgent = 0;
    this.learning = null;
    this.ratio = 0;
    this.stairPosition = null;
    this.clearSpeed = 0;
    this.WIN = new Image();
    this.WIN.src = "images/win.png";
    this.LOSE = new Image();
    this.LOSE.src = "images/lose.png";

    // Create and position the map canvas, then add it to the document
    this.mainCanvas = document.getElementById("canvas");
    this.mapCanvas = document.createElement("canvas");
    this.mapCanvas.id = "minimap";
    this.mapCanvas.width = MAP_CELL_SIZE * NUM_CELLS.x;
    this.mapCanvas.height = MAP_CELL_SIZE * NUM_CELLS.z;
    this.mapCanvas.style.position = "absolute";
    this.mapCanvas.style.bottom = 0;
    this.mapCanvas.style.right = 0;
    this.mapCanvas.style.top = "20px";
    this.mapCanvas.style.right = "20px";
    document.getElementById("container").appendChild(this.mapCanvas);

    this.endingInfo = document.createElement("canvas");
    this.endingInfo.id = "endinginfo";
    this.endingInfo.width = canvas.width;
    this.endingInfo.height = canvas.height;
    this.endingInfo.style.position = "absolute";
    this.endingInfo.style.bottom = 0;
    this.endingInfo.style.right = 0;
    document.getElementById("container").appendChild(this.endingInfo);

    this.playerInfo = document.createElement("canvas");
    this.playerInfo.id = "info";
    this.playerInfo.width = canvas.width / 3;
    this.playerInfo.height = canvas.height / 3;
    this.playerInfo.style.position = "absolute";
    this.playerInfo.style.bottom = 0;
    this.playerInfo.style.right = 0;
    document.getElementById("container").appendChild(this.playerInfo);

    this.hints = document.createElement("canvas");
    this.hints.id = "hints";
    this.hints.width = canvas.width;
    this.hints.height = canvas.height;
    this.hints.style.position = "absolute";
    this.hints.style.bottom = 0;
    this.hints.style.right = 0;
    document.getElementById("container").appendChild(this.hints);

    this.hintIndex = 0;
    this.textHints = ['Click to enable pointer lock@(Press E to skip tutorial)',
                      'Use the WASD keys to move@(Press E to skip tutorial)',
    				  'Use the mouse cursor to look around@(Press E to skip tutorial)',
                      'Press C to crouch and stand up@Crouch lower your speed, but can hide you better@(Press E to skip tutorial)',
    				  'Press F to turn your flashlight on and off@Light can attract warden\'s attention@(Press E to skip tutorial)',
                      'Press spacebar to jump@You can\'t jump when you crouch@(Press E to skip tutorial)',
                      'Press shift and WSAD to run@Run can attract warden\'s attention@(Press E to skip tutorial)',
                      'Your objective will flash in yellow circle in the minimap@Click to open a door or pick up a key@Now move to the closest door and click to open it@(Press E to skip tutorial)',
                      'Great Job!@The warden begins to move now@(Press E to skip tutorial)',
                      'Great Job!@The warden begins to move now@(Press E to skip tutorial)',
                      'Great Job!@The warden begins to move now@(Press E to skip tutorial)',
                      'Great Job!@The warden begins to move now@(Press E to skip tutorial)',
                      'Great Job!@The warden begins to move now@(Press E to skip tutorial)',
                      'Your final goal is to click and pick up the key in the room and find the locked door to escape@(Press E to skip tutorial)',
                      'Your final goal is to click and pick up the key in the room and find the locked door to escape@(Press E to skip tutorial)',
                      'Your final goal is to click and pick up the key in the room and find the locked door to escape@(Press E to skip tutorial)',
                      'Your final goal is to click and pick up the key in the room and find the locked door to escape@(Press E to skip tutorial)',
                      'Your final goal is to click and pick up the key in the room and find the locked door to escape@(Press E to skip tutorial)',
                      'Be careful! The warden\'s eyesight and hearing distance is shown in the minimap@(Press E to skip tutorial)',
                      'Be careful! The warden\'s eyesight and hearing distance is shown in the minimap@(Press E to skip tutorial)',
                      'Be careful! The warden\'s eyesight and hearing distance is shown in the minimap@(Press E to skip tutorial)',
                      'Be careful! The warden\'s eyesight and hearing distance is shown in the minimap@(Press E to skip tutorial)',
                      'Be careful! The warden\'s eyesight and hearing distance is shown in the minimap@(Press E to skip tutorial)',
                      'Try your best to stay away from him@(Press E to skip tutorial)',
                      'Try your best to stay away from him@(Press E to skip tutorial)',
                      'Try your best to stay away from him@(Press E to skip tutorial)',
                      'Try your best to stay away from him@(Press E to skip tutorial)',
                      'Try your best to stay away from him@(Press E to skip tutorial)',
    				  'Your heart beat indicates how close you are to being caught@(Press E to skip tutorial)',
                      'Your heart beat indicates how close you are to being caught@(Press E to skip tutorial)',
                      'Your heart beat indicates how close you are to being caught@(Press E to skip tutorial)',
                      'Your heart beat indicates how close you are to being caught@(Press E to skip tutorial)',
                      'Your heart beat indicates how close you are to being caught@(Press E to skip tutorial)',
    				  'If your heart is beating fast, the warden is close@(Press E to skip tutorial)',
                      'If your heart is beating fast, the warden is close@(Press E to skip tutorial)',
                      'If your heart is beating fast, the warden is close@(Press E to skip tutorial)',
                      'If your heart is beating fast, the warden is close@(Press E to skip tutorial)',
                      'If your heart is beating fast, the warden is close@(Press E to skip tutorial)',
                      'Remember! Stop running, crouch or turn off your flashlight if you want to hide@(Press E to skip tutorial)',
                      'Remember! Stop running, crouch or turn off your flashlight if you want to hide@(Press E to skip tutorial)',
                      'Remember! Stop running, crouch or turn off your flashlight if you want to hide@(Press E to skip tutorial)',
                      'Remember! Stop running, crouch or turn off your flashlight if you want to hide@(Press E to skip tutorial)',
                      'Remember! Stop running, crouch or turn off your flashlight if you want to hide@(Press E to skip tutorial)',
                      'Good luck!@(Press E to skip tutorial)',
                      'Good luck!@(Press E to skip tutorial)',
                      'Good luck!@(Press E to skip tutorial)',
                      'Good luck!@(Press E to skip tutorial)',
                      'Good luck!'];

    this.playHints = ['',
                      'Warning!@Turn off the flashlight(Press F) or Crouch(Press C)@Step back',
                      'Warning!@Turn off the flashligth(Press F) and Crouch(Press C)@Step aside and back',
                      'Dangerous!@Stand up and Run to a safe place',
                      'You are caught by the warden@Please write some story here@story more@and more@and more@and more',
                      'Congratulations!@Please write some story here@story more@and more@and more@and more'];


    // ------------------------------------------------------------------------
    // Private constants ------------------------------------------------------
    // ------------------------------------------------------------------------
    var FOV = 67,
        ASPECT = canvas.width / canvas.height,
        NEAR = .01,
        FAR = 150 * CELL_SIZE;

    // ------------------------------------------------------------------------
    // Game Methods -----------------------------------------------------------
    // ------------------------------------------------------------------------

    this.init = function (input) {
        this.initialized = true;
        this.scene = new THREE.Scene();
        this.camera = null;
        this.objects = null;
        this.models = null;
        this.lights = [];
        this.level = null;
        this.skybox = null;
        this.player = null;
        this.oldplayer = new THREE.Vector3();
        this.warden = null;
        this.soundManager = null;
        this.collisionSet = null;
        this.old = new THREE.Vector3();
        this.old.x = -1;
        this.old.y = -1;
        this.old.z = -1;
        this.key = 0;
        this.end = 0;
        //goal list
        this.nextGoal = new Array(4);
        this.nextGoal[0] = [];
        this.nextGoal[1] = [];
        this.nextGoal[2] = [];
        this.nextGoal[3] = [];
        this.gindex = 0;
        this.numCheck = 0;
        this.modelNum = { number: 0 };
        this.again = false;
        this.box = null;
        this.urgent = 0;
        this.ratio = 0;
        this.learning = { click: 0, W: 0, S: 0, A: 0, D: 0, X1: 0, X2: 0, Y1: 0, Y2: 0, light1: 0, light2: 0, jump: 0, crouch1: 0, crouch2: 0, run: 0 };
        this.stairPosition = new THREE.Vector2();
        this.stairPosition.x = 0;
        this.stairPosition.y = 0;
        this.clearSpeed = 0;
        // Setup scene


        //this.scene.add(new THREE.AmbientLight(0xffffff));
        //this.scene.add(new THREE.AmbientLight(0x06080e));
        this.scene.add(new THREE.AmbientLight(0x0f0f0f));

        // Load the level
        this.level = new Level(this);

        // Setup camera
        this.camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
        this.scene.add(this.camera);


        this.soundManager = new SoundManager();
        this.soundManager.init();

        this.skybox = new Skybox(this);

        // which element in the textHints array to display
        this.hintIndex = 0;
        // set interval handles passing this weird, so you need to make a copy
        var _this = this;
        // update the hint every 5 seconds
        this.hintTimer = setInterval(function () { hintTimerFunc(_this) }, 1000);

        // Setup player
        this.player = new Player();
        this.player.init(this, this.scene, this.camera, this.level.startPos);
        this.oldplayer.x = this.player.mesh.position.x;
        this.oldplayer.y = this.player.mesh.position.y;
        this.oldplayer.z = this.player.mesh.position.z;

        // Initialize warden 
        this.warden = new Warden();
        this.warden.init(this.scene,
        					this.level.wardenPos,
        					this.level.patrolPos,
        					this);

        // Update the view ray (center of canvas into screen)
        this.player.updateViewRay(input);
        console.log("Game initialized.");
    };

    // Update everything in the scene
    // ------------------------------------------------------------------------


    var loaded = false;
    var once = true;
    this.update = function (input) {
        if (this.initialized == false) {
            this.init(input);
        }

        this.level.update();

        this.player.update(input, this.scene);

        handleCollisions(this, input);
        if (input.hold === 0 && input.Jump === 0) {
            input.Jump = 1;
            if (smallDrop(this)) {
                while (input.hold === 0) {
                    this.player.update(input);
                    handleCollisions(this, input);
                }
            }
        }
        updateCollisionSet(this)
        updateScene(this);

        this.warden.update(this, input, this.player.mesh.position, this.player.sound);

        updateOperation(this, input);
        updateDistance(this);
        updatePlayerInformation(this, input);
        if (this.end === 1) {
            if (this.warden.caught)
                ending(this);
            else
                ending(this);
            return false;
        }

        TWEEN.update();
        return true;
    };

    // Draw the scene as seen through the current camera
    // ------------------------------------------------------------------------
    this.render = function (input) {
        this.renderer.render(this.scene, this.camera);
    }
}; // end Game object

function ending(game) {
    var Ending = game.endingInfo.getContext("2d");
    // Clear
    Ending.save();
    Ending.setTransform(1, 0, 0, 1, 0, 0);
    Ending.clearRect(0, 0, game.endingInfo.width, game.endingInfo.height);
    Ending.restore();

    var playerContext = game.playerInfo.getContext("2d");
    playerContext.save();
    playerContext.setTransform(1, 0, 0, 1, 0, 0);
    playerContext.clearRect(0, 0, game.playerInfo.width, game.playerInfo.height);
    playerContext.restore();

    var mapContext = mapCanvas.getContext("2d");
    mapContext.save();
    mapContext.setTransform(1, 0, 0, 1, 0, 0);
    mapContext.clearRect(0, 0, game.mapCanvas.width, game.mapCanvas.height);
    mapContext.restore();

    if (game.warden.caught) {
        Ending.drawImage(game.LOSE, 0, 0, game.LOSE.width, game.LOSE.height, 0, 0, game.endingInfo.width, game.endingInfo.height);
    }
    else {
        Ending.drawImage(game.WIN, 0, 0, game.WIN.width, game.WIN.height, 0, 0, game.endingInfo.width, game.endingInfo.height);
    }

}

function hints(game, message) {
    var hint = game.hints.getContext("2d");
    // Clear
    hint.save();
    hint.setTransform(1, 0, 0, 1, 0, 0);
    hint.clearRect(0, 0, game.hints.width, game.hints.height);
    hint.restore();


    hint.textBaseline = 'bottom';
    hint.textAlign = 'center';
    var allmessage = message.split('@');
    if (game.urgent != 4 && game.urgent != 5) {
        hint.font = '20px Arial';
        hint.fillStyle = '#ffffff';
        for (var i = 0; i < allmessage.length; i++) {
            hint.fillText(allmessage[i], game.hints.width / 2, game.hints.height * (1 / 8 + 1 / 16 * i));
        }
    }
    else {
        setInterval(function () { storyFunc(game) }, 100);
        hint.font = '40px Arial';
        hint.fillStyle = '#ff0000';
        hint.fillText(allmessage[0], game.hints.width / 2, game.hints.height * 1 / 4);
        hint.font = '20px Arial';
        hint.fillStyle = '#ffffff';
        for (var i = 1; i < allmessage.length; i++) {
            hint.fillText(allmessage[i], game.hints.width / 2, game.hints.height * (1 / 3 + 1 / 10 * i));
        }
        hint.clearRect(game.hints.width / 3, game.hints.height * (1 / 3 + game.clearSpeed), game.hints.width / 3, game.hints.height * 2 / 3);
    }



}

function storyFunc(game) {
    game.clearSpeed += 0.001;
    console.log(game.clearSpeed);
    if (game.clearSpeed >= 2 / 3) {
        game.clearSpeed = 2 / 3;
    }
}

function hintTimerFunc(game) {



    if (game.hintIndex < game.textHints.length) {
        hints(game, game.textHints[game.hintIndex]);
    }
    else {
        hints(game, game.playHints[game.urgent]);
    }
    if ((game.learning.click === 1 && game.hintIndex === 0) ||
        (game.learning.W === 1 && game.learning.S === 1 && game.learning.A === 1 && game.learning.D === 1 && game.hintIndex === 1) ||
        (game.learning.X1 === 1 && game.learning.X2 === 1 && game.learning.Y1 === 1 && game.learning.Y2 === 1 && game.hintIndex === 2) ||
        (game.learning.crouch1 === 1 && game.learning.crouch2 === 1 && game.hintIndex === 3) ||
        (game.learning.light1 === 1 && game.learning.light2 === 1 && game.hintIndex === 4) ||
        (game.learning.jump === 1 && game.hintIndex === 5) ||
        (game.learning.run === 1 && game.hintIndex === 6) ||
        (game.gindex === 1 && game.hintIndex === 7) ||
        (game.hintIndex >= 8)
        ) {
        game.hintIndex++;
    }

}

function updatePlayerInformation(game, input) {
    // Clear
    var playerContext = game.playerInfo.getContext("2d");
    playerContext.save();
    playerContext.setTransform(1, 0, 0, 1, 0, 0);
    playerContext.clearRect(0, 0, game.playerInfo.width, game.playerInfo.height);
    playerContext.restore();

    //// Draw the direction information
    //playerContext.beginPath();
    //playerContext.strokeStyle = "#7f7f7f";
    //playerContext.lineWidth = 2;
    //playerContext.arc(game.playerInfo.width / 2, game.playerInfo.height / 2, 60, 0, 2 * Math.PI, false);
    //playerContext.stroke();

    //playerContext.beginPath();
    //playerContext.strokeStyle = "#7f7f7f";
    //playerContext.lineWidth = 2;
    //playerContext.arc(game.playerInfo.width / 2, game.playerInfo.height / 2, 50, 0, 2 * Math.PI, false);
    //playerContext.stroke();

    playerContext.font = '20px Arial';
    playerContext.textBaseline = 'middle';
    playerContext.textAlign = 'center';
    playerContext.fillStyle = '#00ff00';
    var allInfo = game.nextGoal[game.gindex][1].split('@');
    for (var i = 0; i < allInfo.length; i++) {
        playerContext.fillText(allInfo[i], game.playerInfo.width / 2, game.playerInfo.height / 3 + i * game.playerInfo.height / 6);
    }

    ////calculate the distance between the player and the next goal
    //var dis = Math.sqrt((game.player.mesh.position.x - game.nextGoal[game.gindex][0].x) * (game.player.mesh.position.x - game.nextGoal[game.gindex][0].x) +
    //                    (game.player.mesh.position.z - game.nextGoal[game.gindex][0].z) * (game.player.mesh.position.z - game.nextGoal[game.gindex][0].z));

    //var ry = Math.floor(Math.floor(game.player.mesh.position.y) / CELL_SIZE);
    //var gy = game.nextGoal[game.gindex][0].y;

    //var angle = 0;
    //if (dis < CELL_SIZE) {
    //    angle = 2 * Math.PI;
    //}
    //else {
    //    if (dis > 24 * CELL_SIZE) {
    //        angle = -Math.PI / 12;
    //    }
    //    else {
    //        angle = -(-Math.PI / 12 * dis / CELL_SIZE + 25 / 12 * Math.PI);
    //    }
    //}
    //var direction1 = Math.atan2(game.nextGoal[game.gindex][0].z - game.player.mesh.position.z, game.nextGoal[game.gindex][0].x - game.player.mesh.position.x);
    //var direction2 = input.center + input.phi;
    //playerContext.beginPath();
    //playerContext.strokeStyle = "#ffff00";
    //playerContext.lineWidth = 10;
    //if (angle < 2 * Math.PI) {
    //    playerContext.arc(game.playerInfo.width / 2, game.playerInfo.height / 2, 55, -Math.PI / 2 + direction1 - direction2 - angle / 2, -Math.PI / 2 + direction1 - direction2 + angle / 2, true);
    //}
    //else {
    //    playerContext.arc(game.playerInfo.width / 2, game.playerInfo.height / 2, 55, 0, angle, true);
    //}
    //playerContext.stroke();

    //playerContext.beginPath();
    //playerContext.strokeStyle = "#ffffff";
    //playerContext.lineWidth = 1;
    //playerContext.arc(game.playerInfo.width / 2, game.playerInfo.height * 0.41, game.playerInfo.height * 0.025, 0, Math.PI * 2, true);
    //playerContext.stroke();




    //playerContext.strokeStyle = "#ffff00";
    //if (gy > ry) {
    //    playerContext.beginPath();
    //    playerContext.lineWidth = 3;
    //    playerContext.moveTo(game.playerInfo.width / 2, game.playerInfo.height * 0.43);
    //    playerContext.lineTo(game.playerInfo.width / 2, game.playerInfo.height * 0.39);
    //    playerContext.stroke();
    //    playerContext.moveTo(game.playerInfo.width / 2, game.playerInfo.height * 0.39);
    //    playerContext.lineTo(game.playerInfo.width / 2 - game.playerInfo.height * 0.02, game.playerInfo.height * 0.41);
    //    playerContext.stroke();
    //    playerContext.moveTo(game.playerInfo.width / 2, game.playerInfo.height * 0.39);
    //    playerContext.lineTo(game.playerInfo.width / 2 + game.playerInfo.height * 0.02, game.playerInfo.height * 0.41);
    //    playerContext.stroke();
    //}
    //else {
    //    if (gy < ry) {
    //        playerContext.beginPath();
    //        playerContext.lineWidth = 3;
    //        playerContext.moveTo(game.playerInfo.width / 2, game.playerInfo.height * 0.39);
    //        playerContext.lineTo(game.playerInfo.width / 2, game.playerInfo.height * 0.43);
    //        playerContext.stroke();
    //        playerContext.moveTo(game.playerInfo.width / 2, game.playerInfo.height * 0.43);
    //        playerContext.lineTo(game.playerInfo.width / 2 - game.playerInfo.height * 0.02, game.playerInfo.height * 0.41);
    //        playerContext.stroke();
    //        playerContext.moveTo(game.playerInfo.width / 2, game.playerInfo.height * 0.43);
    //        playerContext.lineTo(game.playerInfo.width / 2 + game.playerInfo.height * 0.02, game.playerInfo.height * 0.41);
    //        playerContext.stroke();
    //    }
    //    else {
    //        playerContext.beginPath();
    //        playerContext.lineWidth = 3;
    //        playerContext.moveTo(game.playerInfo.width / 2 - game.playerInfo.height * 0.02, game.playerInfo.height * 0.41);
    //        playerContext.lineTo(game.playerInfo.width / 2 + game.playerInfo.height * 0.02, game.playerInfo.height * 0.41);
    //        playerContext.stroke();


    //    }
    //}

}




function updateCollisionSet(game) {
    var rx = Math.floor(Math.floor(game.player.mesh.position.x) / CELL_SIZE + 1 / 2);
    var rz = Math.floor(Math.floor(game.player.mesh.position.z) / CELL_SIZE + 1 / 2);
    var ry;
    if (game.player.crouch) {
        ry = game.player.mesh.position.y - 2.5;
    }
    else {
        ry = game.player.mesh.position.y - 10;
    }
    ry = Math.floor(ry / CELL_SIZE + 1 / 2);
    if (rx != game.old.x || ry != game.old.y || rz != game.old.z) {
        game.collisionSet = [];

        var append = false;
        for (var z = rz - 1; z <= rz + 1; z++) {
            if (z < 0 || z >= NUM_CELLS.z) {
                continue;
            }
            for (var x = rx - 1; x <= rx + 1; x++) {
                if (x < 0 || x >= NUM_CELLS.x) {
                    continue;
                }


                for (var o = 0; o < game.objects[ry][z][x].length; o++) {
                    game.collisionSet.push(game.objects[ry][z][x][o]);
                    if (game.objects[ry][z][x][o].name === 'stair' || game.objects[ry][z][x][o].name === 'side' || game.objects[ry][z][x][o].name === 'support' || game.objects[ry][z][x][o].name === 'ceil2') {
                        append = true;
                    }
                }
            }
        }

        if (append === true) {
            for (var z = rz - 1; z <= rz + 1; z++) {
                if (z < 0 || z >= NUM_CELLS.z) {
                    continue;
                }
                for (var x = rx - 1; x <= rx + 1; x++) {
                    if (x < 0 || x >= NUM_CELLS.x) {
                        continue;
                    }
                    for (var y = ry - 1; y <= ry + 1; y += 2) {
                        if (y < 0 || y >= NUM_CELLS.y) {
                            continue;
                        }
                        for (var o = 0; o < game.objects[y][z][x].length; o++) {
                            game.collisionSet.push(game.objects[y][z][x][o]);
                        }
                    }
                }
            }
        }
        return true;
    }
    else {
        return false;
    }
}

function updateScene(game) {
    var need = false;
    if (game.old.x === -1 || game.again === true) {
        need = true;
    }
    if (game.modelNum.number !== game.numCheck) {
        game.again = true;
        return;
    }
    else {
        game.again = false;
    }

    if (need === true) {
        var rx = Math.floor(Math.floor(game.player.mesh.position.x) / CELL_SIZE + 1 / 2);
        var rz = Math.floor(Math.floor(game.player.mesh.position.z) / CELL_SIZE + 1 / 2);
        var ry;
        if (game.player.crouch) {
            ry = game.player.mesh.position.y - 2.5;
        }
        else {
            ry = game.player.mesh.position.y - 10;
        }
        ry = Math.floor(ry / CELL_SIZE + 1 / 2);
        for (var z = 0; z < NUM_CELLS.z; z++) {
            for (var x = 0; x < NUM_CELLS.x; x++) {
                var append = false;
                for (var o = 0; o < game.objects[ry][z][x].length; o++) {
                    if (game.objects[ry][z][x][o].name === 'stair' || game.objects[ry][z][x][o].name === 'side' || game.objects[ry][z][x][o].name === 'support' || game.objects[ry][z][x][o].name === 'ceil2' || game.objects[ry][z][x][o].name === 'stairfloor') {
                        append = true;
                    }
                    game.scene.add(game.objects[ry][z][x][o]);
                }
                for (var o = 0; o < game.models[ry][z][x].length; o++) {
                    game.scene.add(game.models[ry][z][x][o]);
                }
                if (append === true) {
                    for (var dx = x - 1; dx <= x + 1; dx++) {
                        if (dx < 0 || dx >= NUM_CELLS.x) {
                            continue;
                        }
                        for (var dz = z - 1; dz <= z + 1; dz++) {
                            if (dz < 0 || dz >= NUM_CELLS.z) {
                                continue;
                            }
                            for (var y = ry - 1; y <= ry + 1; y += 2) {
                                if (y < 0 || y >= NUM_CELLS.y) {
                                    continue;
                                }
                                for (var o = 0; o < game.objects[y][dz][dx].length; o++) {
                                    game.scene.add(game.objects[y][dz][dx][o]);
                                }

                                for (var o = 0; o < game.models[y][dz][dx].length; o++) {
                                    game.scene.add(game.models[y][dz][dx][o]);
                                }
                            }
                        }
                    }
                }
            }
        }
        game.old.x = rx;
        game.old.y = ry;
        game.old.z = rz;
    }
    else {
        var rx = Math.floor(Math.floor(game.player.mesh.position.x) / CELL_SIZE + 1 / 2);
        var rz = Math.floor(Math.floor(game.player.mesh.position.z) / CELL_SIZE + 1 / 2);
        var ry;
        if (game.player.crouch) {
            ry = game.player.mesh.position.y - 2.5;
        }
        else {
            ry = game.player.mesh.position.y - 10;
        }
        var ty = ry;
        ry = Math.floor(ry / CELL_SIZE + 1 / 2);
        var stairRegion = false;
        for (var o = 0; o < game.objects[ry][rz][rx].length; o++) {
            if (game.objects[ry][rz][rx][o].name === 'stair' || game.objects[ry][rz][rx][o].name === 'side' || game.objects[ry][rz][rx][o].name === 'support' || game.objects[ry][rz][rx][o].name === 'ceil2' || game.objects[ry][rz][rx][o].name === 'stairfloor') {
                stairRegion = true;
                break;
            }
        }
        if (stairRegion === false) {
            game.old.x = rx;
            game.old.y = ry;
            game.old.z = rz;
            return;
        }


        if (ty / CELL_SIZE - Math.floor(ty / CELL_SIZE) > 0.11 && ty / CELL_SIZE - Math.floor(ty / CELL_SIZE) < 0.89) {
            game.scene.remove(game.box);
        }
        else {
            game.scene.add(game.box);
        }



        if (ry != game.old.y) {
            for (var z = 0; z < NUM_CELLS.z; z++) {
                for (var x = 0; x < NUM_CELLS.x; x++) {
                    for (var y = ry - 2; y <= ry + 2; y++) {
                        if (y < 0 || y >= NUM_CELLS.y) {
                            continue;
                        }
                        for (var o = 0; o < game.objects[y][z][x].length; o++) {
                            game.scene.remove(game.objects[y][z][x][o]);
                        }
                        for (var o = 0; o < game.models[y][z][x].length; o++) {
                            game.scene.remove(game.models[y][z][x][o]);
                        }
                    }
                }
            }

            for (var z = 0; z < NUM_CELLS.z; z++) {
                for (var x = 0; x < NUM_CELLS.x; x++) {
                    var append = false;
                    for (var o = 0; o < game.objects[ry][z][x].length; o++) {
                        if (game.objects[ry][z][x][o].name === 'stair' || game.objects[ry][z][x][o].name === 'side' || game.objects[ry][z][x][o].name === 'support' || game.objects[ry][z][x][o].name === 'ceil2' || game.objects[ry][z][x][o].name === 'stairfloor') {
                            append = true;
                        }
                        game.scene.add(game.objects[ry][z][x][o]);
                    }
                    for (var o = 0; o < game.models[ry][z][x].length; o++) {
                        game.scene.add(game.models[ry][z][x][o]);
                    }
                    if (append === true) {
                        for (var dx = x - 1; dx <= x + 1; dx++) {
                            if (dx < 0 || dx >= NUM_CELLS.x) {
                                continue;
                            }
                            for (var dz = z - 1; dz <= z + 1; dz++) {
                                if (dz < 0 || dz >= NUM_CELLS.z) {
                                    continue;
                                }
                                for (var y = ry - 1; y <= ry + 1; y += 2) {
                                    if (y < 0 || y >= NUM_CELLS.y) {
                                        continue;
                                    }
                                    for (var o = 0; o < game.objects[y][dz][dx].length; o++) {
                                        game.scene.add(game.objects[y][dz][dx][o]);
                                    }

                                    for (var o = 0; o < game.models[y][dz][dx].length; o++) {
                                        game.scene.add(game.models[y][dz][dx][o]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        game.old.x = rx;
        game.old.y = ry;
        game.old.z = rz;
    }
}

var DOOR_TIMEOUT = 750; // milliseconds between door toggles
function updateOperation(game, input) {
    if (input.Escape === 1) {
        if (game.hintIndex < game.textHints.length - 1) {
            game.hintIndex = game.textHints.length - 1;
        }
    }
    if (game.hintIndex === 0) {
        if (input.click === 1) {
            game.learning.click = 1;
        }
    }
    if (game.hintIndex === 1) {
        if (input.trigger.W === 1) {
            game.learning.W = 1;
        }

        if (input.trigger.S === 1) {
            game.learning.S = 1;
        }
        if (input.trigger.A === 1) {
            game.learning.A = 1;
        }
        if (input.trigger.D === 1) {
            game.learning.D = 1;
        }
    }
    if (game.hintIndex === 2) {
        if (input.X > 0) {
            game.learning.X1 = 1;
        }
        if (input.X < 0) {
            game.learning.X2 = 1;
        }
        if (input.Y > 0) {
            game.learning.Y1 = 1;
        }
        if (input.Y < 0) {
            game.learning.Y2 = 1;
        }
    }
    if (game.hintIndex === 3) {
        if (input.trigger.crouch === 1 && game.player.crouch === 0) {
            game.learning.crouch1 = 1;
        }
        if (input.trigger.crouch === 1 && game.player.crouch === 1) {
            game.learning.crouch2 = 1;
        }
    }
    if (game.hintIndex === 4) {
        if (input.trigger.light === 1 && game.player.lightOn === true) {
            game.learning.light1 = 1;
        }
        if (input.trigger.light === 1 && game.player.lightOn === false) {
            game.learning.light2 = 1;
        }
    }
    if (game.hintIndex === 5) {
        if (input.trigger.Jump === 1 && game.player.crouch === 0) {
            game.learning.jump = 1;
        }
    }

    if (game.hintIndex === 6) {
        if (input.trigger.run === 1 && (input.trigger.W === 1 || input.trigger.S === 1 || input.trigger.A === 1 || input.trigger.D === 1)) {
            game.learning.run = 1;
        }
    }




    if (input.click === 1) {
        input.click = 0;
        var rx = Math.floor(Math.floor(game.player.mesh.position.x) / CELL_SIZE + 1 / 2);
        var rz = Math.floor(Math.floor(game.player.mesh.position.z) / CELL_SIZE + 1 / 2);
        var ry;
        if (game.player.crouch) {
            ry = game.player.mesh.position.y - 2.5;
        }
        else {
            ry = game.player.mesh.position.y - 10;
        }
        ry = Math.floor(ry / CELL_SIZE + 1 / 2);
        for (var z = rz - 1; z <= rz + 1; z++) {
            if (z < 0 || z >= NUM_CELLS.z) {
                continue;
            }
            for (var x = rx - 1; x <= rx + 1; x++) {
                if (x < 0 || x >= NUM_CELLS.x) {
                    continue;
                }

                var collision = input.viewRay.intersectObjects(game.objects[ry][z][x]);
                if (collision.length > 0) {
                    switch (collision[0].object.name) {
                        case 'door':
                            if (game.gindex === 0) {
                                if (game.hintIndex >= 7) {
                                    game.gindex++;
                                }
                                else {
                                    break;
                                }
                            }
                            var door = collision[0].object, tween;
                            var ob = door.model;
                            if (door.doorState === "closed" && door.canToggle && (!door.special || game.gindex >= 2)) {
                                var ix = door.position.x - door.halfsize * 15 / 16 * Math.sin(door.beginRot);
                                var iz = door.position.z - door.halfsize * 15 / 16 * Math.cos(door.beginRot);
                                tween = new TWEEN.Tween({ rot: door.beginRot })
                                                 .to({ rot: door.endRot }, DOOR_TIMEOUT)
                                                 .easing(TWEEN.Easing.Elastic.Out)
                                                 .onUpdate(function () {
                                                     door.rotation.y = this.rot;
                                                     ob.rotation.y = this.rot;
                                                     door.position.x = ix + door.halfsize * 15 / 16 * Math.sin(this.rot);
                                                     door.position.z = iz + door.halfsize * 15 / 16 * Math.cos(this.rot);
                                                     ob.position.x = door.position.x;
                                                     ob.position.z = door.position.z;

                                                 })
                                                 .start();

                                door.doorState = "open";
                                door.canToggle = false;

                                setTimeout(function () {
                                    door.canToggle = true;
                                }, DOOR_TIMEOUT);
                            } else if (door.doorState === "open" && door.canToggle && (!door.special || game.gindex >= 2)) {
                                var ix = door.position.x - door.halfsize * 15 / 16 * Math.sin(door.endRot);
                                var iz = door.position.z - door.halfsize * 15 / 16 * Math.cos(door.endRot);
                                tween = new TWEEN.Tween({ rot: door.endRot })
                                    .to({ rot: door.beginRot }, DOOR_TIMEOUT)
                                    .easing(TWEEN.Easing.Elastic.Out)
                                    .onUpdate(function () {
                                        door.rotation.y = this.rot;
                                        ob.rotation.y = this.rot;
                                        door.position.x = ix + door.halfsize * 15 / 16 * Math.sin(this.rot);
                                        door.position.z = iz + door.halfsize * 15 / 16 * Math.cos(this.rot);
                                        ob.position.x = door.position.x;
                                        ob.position.z = door.position.z;

                                    })
                                    .start();

                                door.doorState = "closed";
                                door.canToggle = false;

                                setTimeout(function () {
                                    door.canToggle = true;
                                }, DOOR_TIMEOUT);
                            }
                            break;
                        case 'key':
                            game.scene.remove(collision[0].object);
                            game.scene.remove(collision[0].object.model);
                            for (var m = 0; m < game.models[ry][z][x].length; m++) {
                                if (game.models[ry][z][x][m] === collision[0].object.model) {
                                    game.models[ry][z][x].splice(m, 1);
                                    break;
                                }
                            }

                            for (var o = 0; o < game.objects[ry][z][x].length; o++) {
                                if (game.objects[ry][z][x][o] === collision[0].object) {
                                    game.objects[ry][z][x].splice(o, 1);
                                    break;
                                }
                            }
                            game.key = 1;
                            game.gindex++;
                            break;
                        case 'fdoor':
                            if (game.key === 1) {
                                game.urgent = 1;
                                game.end = 1;
                            }
                            break;
                    }
                }
            }
        }
    }
}

function updateDistance(game) {
    if (game.player.mesh !== null && game.warden.mesh !== null && (game.warden.vX != 0 || game.warden.vZ != 0)) {
        var z1 = game.player.mesh.position.z - game.warden.mesh.position.z;
        var x1 = game.player.mesh.position.x - game.warden.mesh.position.x;
        var ry;
        if (game.player.crouch) {
            ry = game.player.mesh.position.y - 2.5;
        }
        else {
            ry = game.player.mesh.position.y - 10;
        }
        ry = Math.floor(ry / CELL_SIZE + 1 / 2);
        var my = Math.floor(Math.floor(game.warden.mesh.position.y) / CELL_SIZE);
        if (ry != my) {
            game.urgent = 0;
        }
        else {
            var dotProduct = z1 * game.warden.vZ + x1 * game.warden.vX;
            var length1 = Math.sqrt(x1 * x1 + z1 * z1);
            var length2 = Math.sqrt(game.warden.vZ * game.warden.vZ + game.warden.vX * game.warden.vX);
            var angle;
            if (dotProduct >= length1 * length2) {
                angle = 0;
            }
            else {
                angle = Math.acos(dotProduct / (length1 * length2));
            }
            if (angle < Math.PI / 6) {
                if (length1 < 8 * CELL_SIZE) {
                    game.urgent = 1;
                    if (length1 < 5 * CELL_SIZE) {
                        game.urgent = 2;
                        if (length1 < 2 * CELL_SIZE) {
                            game.urgent = 3;
                            if (length1 < 10) {
                                game.urgent = 4;
                            }
                        }
                    }
                }
                else {
                    game.urgent = 0;
                }
            }
            else {
                game.urgent = 0;
            }
        }
    }
}

function smallDrop(game) {
    for (var vertexIndex = 0; vertexIndex < game.player.mesh.geometry.vertices.length; vertexIndex++) {
        var directionVector = game.player.mesh.geometry.vertices[vertexIndex].clone();
        for (var t = 0.0; t <= 2; t = t + 0.1) {
            ray = new THREE.Ray(new THREE.Vector3(game.player.mesh.position.x, game.player.mesh.position.y - t, game.player.mesh.position.z), directionVector.clone().normalize());
            collisionResults = ray.intersectObjects(game.collisionSet);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                return true;
            }
        }
    }
    return false;
}


function bumpUp(collisionResults, directionVector, game) {
    var t;
    for (t = 0.1; t <= 5; t = t + 0.1) {
        ray = new THREE.Ray(new THREE.Vector3(game.player.mesh.position.x, game.player.mesh.position.y + t, game.player.mesh.position.z), directionVector.clone().normalize());
        collisionResults = ray.intersectObjects(game.collisionSet);
        if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() > 1e-6) {
            break;
        }
    }


    for (var vertexIndex = 0; vertexIndex < game.player.mesh.geometry.vertices.length; vertexIndex++) {
        var allDirectionVector = game.player.mesh.geometry.vertices[vertexIndex].clone();
        var ray = new THREE.Ray(new THREE.Vector3(game.player.mesh.position.x, game.player.mesh.position.y + t, game.player.mesh.position.z), allDirectionVector.clone().normalize());
        var allCollisionResults = ray.intersectObjects(game.collisionSet);
        if (allCollisionResults.length > 0 && allCollisionResults[0].distance - allDirectionVector.length() < -1e-6) {
            return vertexIndex;
        }
    }
    game.player.mesh.position.y += t;
    return -1;
}


function bumpBack(collisionResults, directionVector, game) {
    var i = 0;
    var j = 0;
    var k = 0;
    var bumpx = 0;
    var bumpy = 0;
    var bumpz = 0;
    if (game.player.mesh.position.x - game.oldplayer.x > 0) {
        bumpx = 0;
        for (i = 0.1; i <= game.player.mesh.position.x - game.oldplayer.x; i += 0.1) {
            ray = new THREE.Ray(new THREE.Vector3(game.oldplayer.x + i, game.oldplayer.y, game.oldplayer.z), directionVector.clone().normalize());
            collisionResults = ray.intersectObjects(game.collisionSet);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                bumpx = -1;
                break;
            }
        }

        i -= 0.1;
    }
    if (game.player.mesh.position.x - game.oldplayer.x < 0) {
        bumpx = 0;
        for (i = -0.1; i >= game.player.mesh.position.x - game.oldplayer.x; i -= 0.1) {
            ray = new THREE.Ray(new THREE.Vector3(game.oldplayer.x + i, game.oldplayer.y, game.oldplayer.z), directionVector.clone().normalize());
            collisionResults = ray.intersectObjects(game.collisionSet);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                bumpx = 1;
                break;
            }
        }

        i += 0.1;

    }

    if (game.player.mesh.position.y - game.oldplayer.y > 0) {
        bumpy = 0;
        for (j = 0.1; j <= game.player.mesh.position.y - game.oldplayer.y; j += 0.1) {
            ray = new THREE.Ray(new THREE.Vector3(game.oldplayer.x + i, game.oldplayer.y + j, game.oldplayer.z), directionVector.clone().normalize());
            collisionResults = ray.intersectObjects(game.collisionSet);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                bumpy = -1;
                break;
            }
        }

        j -= 0.1;

    }
    if (game.player.mesh.position.y - game.oldplayer.y < 0) {
        bumpy = 0;
        for (j = -0.1; j >= game.player.mesh.position.y - game.oldplayer.y; j -= 0.1) {
            ray = new THREE.Ray(new THREE.Vector3(game.oldplayer.x + i, game.oldplayer.y + j, game.oldplayer.z), directionVector.clone().normalize());
            collisionResults = ray.intersectObjects(game.collisionSet);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                bumpy = 1;
                break;
            }
        }

        j += 0.1;

    }

    if (game.player.mesh.position.z - game.oldplayer.z > 0) {
        bumpz = 0;
        for (k = 0.1; k <= game.player.mesh.position.z - game.oldplayer.z; k += 0.1) {
            ray = new THREE.Ray(new THREE.Vector3(game.oldplayer.x + i, game.oldplayer.y + j, game.oldplayer.z + k), directionVector.clone().normalize());
            collisionResults = ray.intersectObjects(game.collisionSet);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                bumpz = -1;
                break;
            }
        }

        k -= 0.1;

    }
    if (game.player.mesh.position.z - game.oldplayer.z < 0) {
        bumpz = 0;
        for (k = -0.1; k >= game.player.mesh.position.z - game.oldplayer.z; k -= 0.1) {
            ray = new THREE.Ray(new THREE.Vector3(game.oldplayer.x + i, game.oldplayer.y + j, game.oldplayer.z + k), directionVector.clone().normalize());
            collisionResults = ray.intersectObjects(game.collisionSet);
            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                bumpz = 1;
                break;
            }
        }
        if (bumpz === 1) {
            k += 0.1;
        }
    }

    game.player.mesh.position.add(game.oldplayer, new THREE.Vector3(i, j, k));
    return bumpy;
}

// ----------------------------------------------------------------------------
// Handle collision detection
// ----------------------------------------------------------------------------

function handleCollisions(game, input) {
    if (input.trigger.A || input.trigger.D || input.trigger.W || input.trigger.S || input.hold === 0) {
        var count = 0;
        for (var vertexIndex = 0; vertexIndex < game.player.mesh.geometry.vertices.length; vertexIndex++) {
            var directionVector = game.player.mesh.geometry.vertices[vertexIndex].clone();
            var ray = new THREE.Ray(game.player.mesh.position, directionVector.clone().normalize());
            var collisionResults = ray.intersectObjects(game.collisionSet);
            var g = 0;
            while (g < collisionResults.length) {
                if (collisionResults[g].object.name === "door" && collisionResults[g].object.doorState === 'open') {
                    collisionResults.splice(g, 1);
                } else {
                    g++;
                }
            }

            if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < 1e-6) {
                var selected = collisionResults[0].object;
                if (collisionResults.length > 0 && collisionResults[0].distance - directionVector.length() < -1e-6) {
                    if (selected.name === 'ceil' || selected.name === 'ceil2' || selected.name === 'wall' || selected.name === 'window-wall' || selected.name === 'side' || selected.name === 'support' ||
                        selected.name === 'column' || selected.name === 'model' || selected.name === 'key' || selected.name === 'fdoor' || selected.name === 'door') {
                        var verticalInfo = bumpBack(collisionResults, directionVector, game);
                        if (verticalInfo != 0) {
                            input.v = 0;
                            if (verticalInfo > 0) {
                                input.hold = 1;
                            }
                        }
                    }
                    else {
                        if (selected.name === 'stair' || selected.name === 'floor' || selected.name === 'stairfloor') {
                            input.hold = 1;
                            input.v = 0;
                            var newCollide = bumpUp(collisionResults, directionVector, game);
                            if (newCollide !== -1) {
                                bumpBack(collisionResults, directionVector, game);
                            }
                        }
                    }
                }
            }
            else {
                count++;
            }
        }
        if (count === game.player.mesh.geometry.vertices.length) {
            input.hold = 0;
        }
        game.oldplayer.copy(game.player.mesh.position);
    }
}

