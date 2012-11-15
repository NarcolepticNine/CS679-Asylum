var CELL_TYPES = {
    nothing: ' ',
    floor: 'f',
    ceil: 'c',
    wall: 'w',
    start: 's',
    key: 'k',
},
    MAP_CELL_SIZE = 10,
    CELL_SIZE = 32,
    rows,
    NUM_CELLS = new THREE.Vector3(0, 0, 0);

NUM_CELLS.y = numFloors;
for (y = 0; y < numFloors; ++y) {
    //break apart map[i] into rows on \n 
    rows = Map[y].split("\n");
    NUM_CELLS.z = NUM_CELLS.z > rows.length ? NUM_CELLS.z : rows.length;
    for (z = 0; z < NUM_CELLS.z; ++z) {
        NUM_CELLS.x = NUM_CELLS.x > rows[z].length ? NUM_CELLS.x : rows[z].length;
    }
}



// ----------------------------------------------------------------------------
// Level 
// ----------------------------------------------------------------------------
function Level(game) {
    // ------------------------------------------------------------------------
    // Public properties ------------------------------------------------------
    // ------------------------------------------------------------------------
    this.grid = null;
    this.geometry = {
        floor: [],
        ceil: [],
        wall: []
    };
    this.mapCanvas = null;
    this.mapContext = null;
    this.mapColors = {};
    this.startPos = new THREE.Vector3();

    // ------------------------------------------------------------------------
    // Private constants ------------------------------------------------------
    // ------------------------------------------------------------------------
    FLOOR_TEXTURE = THREE.ImageUtils.loadTexture("images/floor.png"),
    CEIL_TEXTURE = THREE.ImageUtils.loadTexture("images/stone.png"),
    WALL_TEXTURE = THREE.ImageUtils.loadTexture("images/brick.png"),

    FLOOR_TEXTURE.repeat = new THREE.Vector2(2, 2);
    FLOOR_TEXTURE.wrapS = THREE.RepeatWrapping;
    FLOOR_TEXTURE.wrapT = THREE.RepeatWrapping;

    // Populates grid; parse Map Array from map.js
    // -------------------------------------------------------
    this.populateGrid = function () {

        //eventually pull more than just map[0] 

        //for each character in each row, check character, and set grid to 
        // that cell type. 
        for (var y = 0; y < numFloors; y++) {
            //break apart map[i] into rows on \n
            rows = Map[y].split("\n");
            for (var z = 0; z < rows.length; z++) {
                for (var x = 0; x < rows[z].length; x++) {
                    switch (rows[z].charAt(x)) {
                        case CELL_TYPES.wall:
                            this.grid[y][z][x] = new Cell(x, y, z, CELL_TYPES.wall);
                            break;
                        case CELL_TYPES.start:
                            this.grid[y][z][x] = new Cell(x, y, z, CELL_TYPES.start);
                            this.addStartPosition(x, y, z);
                            break;
                       case CELL_TYPES.key:
                            this.grid[y][z][x] = new Cell(x, y, z, CELL_TYPES.key);
                            break;
                        case CELL_TYPES.floor:
                            this.grid[y][z][x] = new Cell(x, y, z, CELL_TYPES.floor);
                            break;
                        case CELL_TYPES.ceil:
                            this.grid[y][z][x] = new Cell(x, y, z, CELL_TYPES.ceil);
                            break;
                        case CELL_TYPES.nothing:
                            this.grid[y][z][x] = new Cell(x, y, z, CELL_TYPES.nothing);
                            break;
                    }
                }
            }
        }
    };

    // Generate a 3d array of NUM_CELLS.x by NUM_CELLS.y by NUM_CELLS.z cells
    // -------------------------------------------------------
    this.generateGridCells = function () {
        var x, y, z;
        this.grid = new Array(NUM_CELLS.y);
        for (y = 0; y < NUM_CELLS.y; ++y) {
            this.grid[y] = new Array(NUM_CELLS.z);
            for (z = 0; z < NUM_CELLS.z; ++z) {
                this.grid[y][z] = new Array(NUM_CELLS.x);
                for (x = 0; x < NUM_CELLS.x; ++x) {
                    this.grid[y][z][x] = new Cell(x, y, z, CELL_TYPES.nothing);
                }
            }
        }
    };


    // Print the grid layout in ascii format to the console
    // ----------------------------------------------------
    this.debugPrint = function () {
        var x, y, z, str = "";
        // Print entire grid layout
        for (y = 0; y < NUM_CELLS.y; ++y) {
            str += "Floor " + y + "\n";
            for (z = 0; z < NUM_CELLS.z; ++z) {
                for (x = 0; x < NUM_CELLS.x; ++x) {
                    str += this.grid[y][z][x].type;
                }
                str += "\n";
            }
            str += "\n";
        }
        console.log(str);
    };

    // Creates new geometry based on grid layout
    // -----------------------------------------
    this.generateGeometry = function () {
        var x, y, z, xx, yy, zz, cell;

        for (y = 0; y < NUM_CELLS.y; ++y) {
            for (z = 0; z < NUM_CELLS.z; ++z) {
                for (x = 0; x < NUM_CELLS.x; ++x) {
                    cell = this.grid[y][z][x];
                    xx = x * CELL_SIZE;
                    yy = y * CELL_SIZE;
                    zz = z * CELL_SIZE;
                    // Generate geometry according to cell type
                    if (cell.type === CELL_TYPES.nothing) {
                        continue;
                    } else if (cell.type === CELL_TYPES.start || cell.type === CELL_TYPES.floor) {
                        this.generateFloorGeometry(xx, yy, zz);
                    } else if (cell.type === CELL_TYPES.key) {
                    	this.generateFloorGeometry(xx, yy, zz);
                    	this.generateObjGeometry(xx, yy + 8, zz, .5, 'obj/key.js');
                    } else if (cell.type === CELL_TYPES.ceil) {
                        this.generateCeilingGeometry(xx, yy, zz);
                    } else if (cell.type === CELL_TYPES.wall) {
                        this.generateWallGeometry(xx, yy, zz);
                    }
                }
            }
        }
    };

    // Generate floor geometry 
    var PLANE_GEOMETRY = new THREE.PlaneGeometry(CELL_SIZE, CELL_SIZE),
        FLOOR_MATERIAL = new THREE.MeshPhongMaterial({ map: FLOOR_TEXTURE });

    this.generateFloorGeometry = function (x, y, z) {
        var mesh = new THREE.Mesh(PLANE_GEOMETRY, FLOOR_MATERIAL);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(x, y, z);
        game.objects.push(mesh);
        game.scene.add(mesh);
        this.geometry.floor.push(mesh);
    };
    
    // Generate Obj geometyr
    this.generateObjGeometry = function (x, y, z, scale, obj) {
    
    	var loader = new THREE.JSONLoader();
		var cbo = function( geometry ) { createGeo( geometry,  x, y, z, scale ) };

		loader.load(obj, cbo);

    };
    
    function createGeo( geometry, x, y, z, scale ) {
		var objMesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial() );
		objMesh.position.set( x, y, z );
		objMesh.scale.set( scale, scale, scale );
		game.objects.push(objMesh);
		game.scene.add(objMesh);
	}

    // Generate ceiling geometry
    var CEIL_MATERIAL = new THREE.MeshPhongMaterial({ map: CEIL_TEXTURE });
    this.generateCeilingGeometry = function (x, y, z) {
        var mesh = new THREE.Mesh(PLANE_GEOMETRY, CEIL_MATERIAL);
        mesh.rotation.x = Math.PI / 2;
        mesh.position.set(x, y + CELL_SIZE, z);
        game.objects.push(mesh);
        game.scene.add(mesh);
        this.geometry.ceil.push(mesh);
    };

    // Generate wall geometry
    // --------------------------------
    var CUBE_GEOMETRY = new THREE.CubeGeometry(CELL_SIZE, CELL_SIZE, CELL_SIZE),
        WALL_MATERIAL = new THREE.MeshPhongMaterial({ map: WALL_TEXTURE });

    this.generateWallGeometry = function (x, y, z) {
        var mesh = new THREE.Mesh(CUBE_GEOMETRY, WALL_MATERIAL);
        mesh.position.set(x, y + CELL_SIZE / 2, z);
        game.objects.push(mesh);
        game.scene.add(mesh);
        this.geometry.wall.push(mesh);
    }


    // Add randomized starting location for player
    // -------------------------------------------
    this.addStartPosition = function (x, y, z) {
        this.startPos = new THREE.Vector3(x * CELL_SIZE, y * CELL_SIZE, z * CELL_SIZE);

    };

    // Generate minimap using a 2d canvas
    // ----------------------------------
    this.generateMinimap = function () {
        // Save the 2d context for this canvas
        mapCanvas = document.getElementById("minimap");
        mapContext = mapCanvas.getContext("2d");
        // Setup colors for each cell type
        this.mapColors.nothing = "#202020";
        this.mapColors.floor = "#00004f";
        this.mapColors.ceil = "#4f0000";
        this.mapColors.wall = "#c0c0c0";
    };

    // Update minimap
    // --------------------------------
    this.updateMinimap = function () {
        var x, z, xx, zz, px, pz, ry, cell, color;

        // Calculate the player's position on the minimap
        px = Math.floor(game.player.position.x / CELL_SIZE * MAP_CELL_SIZE) + MAP_CELL_SIZE / 2;
        pz = Math.floor(game.player.position.z / CELL_SIZE * MAP_CELL_SIZE) + MAP_CELL_SIZE / 2;

        console.log(game.player.position.y);
        ry = Math.floor(Math.floor(game.player.position.y) / CELL_SIZE);

        // Clear the map
        mapContext.save();
        mapContext.setTransform(1, 0, 0, 1, 0, 0);
        mapContext.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
        mapContext.restore();

        // Blend the map a bit
        mapContext.globalAlpha = 0.5;

        // Draw the map cells
        for (z = 0; z < NUM_CELLS.z; ++z) {
            for (x = 0; x < NUM_CELLS.x; ++x) {
                cell = this.grid[ry][z][x];
                xx = x * MAP_CELL_SIZE;
                zz = z * MAP_CELL_SIZE;

                switch (cell.type) {
                    case CELL_TYPES.nothing: color = this.mapColors.nothing; break;
                    case CELL_TYPES.ceil: color = this.mapColors.ceil; break;
                    case CELL_TYPES.start: color = this.mapColors.floor; break;
                    case CELL_TYPES.floor: color = this.mapColors.floor; break;
                    case CELL_TYPES.wall: color = this.mapColors.wall; break;
                }

                mapContext.fillStyle = color;
                mapContext.fillRect(xx, zz, MAP_CELL_SIZE, MAP_CELL_SIZE);

            }
        }

        // Draw the player
        mapContext.beginPath();
        mapContext.strokeStyle = "#ff0000";
        mapContext.lineWidth = 3;
        mapContext.arc(px, pz, 3, 0, 2 * Math.PI, false);
        mapContext.stroke();
    };

    // Update this level
    // --------------------------------
    this.update = function () {
        this.updateMinimap();
    };

    // ------------------------------------------------------------------------
    // generate the maze
    // ------------------------------------------------------------------------
    (function generate(level) {
        console.info("Generating level...");
        level.generateGridCells();
        level.populateGrid();
        level.generateMinimap();
        level.generateGeometry();
        console.info("Level generation completed.");
        level.debugPrint();
    })(this);

}


// ----------------------------------------------------------------------------
// Cell  
// ----------------------------------------------------------------------------
function Cell(x, y, z, type) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.type = type;
}