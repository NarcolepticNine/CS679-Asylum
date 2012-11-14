var CELL_TYPES = {
    nothing: ".",
    empty: " ",
    wall: "*",
},
    MAP_CELL_SIZE = 10,
    CELL_SIZE = 32,
    NUM_CELLS = new THREE.Vector2(40, 40);

// ----------------------------------------------------------------------------
// Level 
// ----------------------------------------------------------------------------
function Level(game) {
    // ------------------------------------------------------------------------
    // Public properties ------------------------------------------------------
    // ------------------------------------------------------------------------
    this.grid = null;
    this.geometry = {
        floors: [],
        ceils: []
    };
    this.mapCanvas = null;
    this.mapContext = null;
    this.mapColors = {};
    this.startPos = new THREE.Vector2();

    // Static geometry groups ------------------------
    // Normal walls
    this.wallGroup = new THREE.Object3D();
    this.wallGeometry = new THREE.Geometry();

    // ------------------------------------------------------------------------
    // Private constants ------------------------------------------------------
    // ------------------------------------------------------------------------
    FLOOR_TEXTURE = THREE.ImageUtils.loadTexture("images/floor.png"),
    CEIL_TEXTURE = THREE.ImageUtils.loadTexture("images/stone.png"),
    WALL_TEXTURE = THREE.ImageUtils.loadTexture("images/brick.png"),

    FLOOR_TEXTURE.repeat = new THREE.Vector2(2, 2);
    FLOOR_TEXTURE.wrapS = THREE.RepeatWrapping;
    FLOOR_TEXTURE.wrapT = THREE.RepeatWrapping;


    // Populates grid with rooms; parse Map Array from map.js
    // -------------------------------------------------------
    this.populateGrid = function () {
    
    	//eventually pull more than just map[0] 
    
    	//break apart map[i] into rows on \n 
    	var rows = Map[0].split("\n"); 
    	
    	//for each character in each row, check character, and set grid to 
    	// that cell type. 
    	for( var i = 0; i < rows.length; i++ ){
    		for( var j = 0; j < rows[i].length; j++ ) {
    			switch( rows[i].charAt(j) ){
    				case 'w':
    					this.grid[i][j] = new Cell( j, i, CELL_TYPES.wall ); 
    					break;
    				case 's':
    					this.grid[i][j] = new Cell( j, i, CELL_TYPES.empty);
    					this.addStartPosition( j, i ); 
    					break;
    				case ' ':
    					this.grid[i][j] = new Cell( j, i, CELL_TYPES.empty); 
    					break; 
    			}
    		}
    	}
    };

    // Generate a 2d array of NUM_CELLS.x by NUM_CELLS.y cells
    // -------------------------------------------------------
    this.generateGridCells = function () {
        var x, y;

        this.grid = new Array(NUM_CELLS.y);
        for (y = 0; y < NUM_CELLS.y; ++y) {
            this.grid[y] = new Array(NUM_CELLS.x);
            for (x = 0; x < NUM_CELLS.x; ++x) {
                this.grid[y][x] = new Cell(x, y, CELL_TYPES.nothing);
            }
        }
    };


    // Print the grid layout in ascii format to the console
    // ----------------------------------------------------
    this.debugPrint = function () {
        var x, y, str = "";
        // Print entire grid layout
        for (y = 0; y < NUM_CELLS.y; ++y) {
            for (x = 0; x < NUM_CELLS.x; ++x) {
                str += this.grid[y][x].type;
            }
            str += "\n";
        }
        console.log(str);
    };

    // Create features in the map
    // --------------------------------
    this.generateFeatures = function () {
        //this.addStartPosition();
    };

    // Creates new geometry based on grid layout
    // -----------------------------------------
    this.generateGeometry = function () {
        var x, y, xx, yy, cell;

        for (y = 0; y < NUM_CELLS.y; ++y) {
            for (x = 0; x < NUM_CELLS.x; ++x) {
                cell = this.grid[y][x];
                xx = x * CELL_SIZE;
                yy = y * CELL_SIZE;

                // Generate geometry according to cell type
                if (cell.type === CELL_TYPES.nothing) {
                    continue;
                } else if (cell.type === CELL_TYPES.empty) {
                    this.generateFloorGeometry(xx, yy);
                    this.generateCeilingGeometry(xx, yy);
                } else if (cell.type === CELL_TYPES.wall) {
                    this.generateWallGeometry(xx, yy);
                }
            }
        }
        var wallMaterial = WALL_FULL_MATERIAL;

        // Create merged geometry groups
        this.wallGroup = new THREE.Mesh(this.wallGeometry, wallMaterial);

        // Add merged geometry groups to game object array
        game.objects.push(this.wallGroup);

        // Add merged geometry groups to scene
        game.scene.add(this.wallGroup);
    };

    // Generate floor geometry 
    var PLANE_GEOMETRY = new THREE.PlaneGeometry(CELL_SIZE, CELL_SIZE),
        FLOOR_MATERIAL = new THREE.MeshPhongMaterial({ map: FLOOR_TEXTURE });

    this.generateFloorGeometry = function (x, y) {
        var mesh = new THREE.Mesh(PLANE_GEOMETRY, FLOOR_MATERIAL);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(x, 0, y);
        game.objects.push(mesh);
        game.scene.add(mesh);
        this.geometry.floors.push(mesh);
    };

    // Generate ceiling geometry
    var CEIL_MATERIAL = new THREE.MeshPhongMaterial({ map: CEIL_TEXTURE });
    this.generateCeilingGeometry = function (x, y) {
        var mesh = new THREE.Mesh(PLANE_GEOMETRY, CEIL_MATERIAL);
        mesh.rotation.x = Math.PI / 2;
        mesh.position.set(x, 2 * CELL_SIZE, y);
        game.objects.push(mesh);
        game.scene.add(mesh);
        this.geometry.ceils.push(mesh);
    };

    // Generate wall geometry
    // --------------------------------
    var NORMAL_MATERIAL = new THREE.MeshNormalMaterial(),
        WALL_FULL_MATERIAL = new THREE.MeshPhongMaterial({ map: WALL_TEXTURE }),
    // Geometry -----
        WALL_FULL_GEOMETRY = new THREE.CubeGeometry(CELL_SIZE, 2 * CELL_SIZE, CELL_SIZE,
            1, 1, 1, NORMAL_MATERIAL,
            { px: true, nx: true, py: false, ny: false, pz: true, nz: true }),
    // Mesh -----
        WALL_MESH = new THREE.Mesh(WALL_FULL_GEOMETRY, NORMAL_MATERIAL);

    for (var face in WALL_FULL_GEOMETRY.faces) {
        WALL_FULL_GEOMETRY.faces[face].materialIndex = 0;
    }

    this.generateWallGeometry = function (x, y) {
        // Position geometry for the current cell and merge it with the rest 
        WALL_MESH.position.set(x, CELL_SIZE, y);
        THREE.GeometryUtils.merge(this.wallGeometry, WALL_MESH);
    };

    // Add randomized starting location for player
    // -------------------------------------------
    this.addStartPosition = function ( x, y) {
        this.startPos = new THREE.Vector2(x * CELL_SIZE, y * CELL_SIZE);
    };

    // Generate minimap using a 2d canvas
    // ----------------------------------
    this.generateMinimap = function () {
        // Save the 2d context for this canvas
        mapCanvas = document.getElementById("minimap");
        mapContext = mapCanvas.getContext("2d");
        // Setup colors for each cell type
        this.mapColors.nothing = "#202020";
        this.mapColors.empty = "#000000";
        this.mapColors.wall = "#c0c0c0";
    };

    // Update minimap
    // --------------------------------
    this.updateMinimap = function () {
        var x, y, xx, yy, px, py, cell, color;

        // Calculate the player's position on the minimap
        px = Math.floor(game.player.position.x / CELL_SIZE * MAP_CELL_SIZE) + MAP_CELL_SIZE / 2;
        py = Math.floor(game.player.position.z / CELL_SIZE * MAP_CELL_SIZE) + MAP_CELL_SIZE / 2;

        // Clear the map
        mapContext.save();
        mapContext.setTransform(1, 0, 0, 1, 0, 0);
        mapContext.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
        mapContext.restore();

        // Blend the map a bit
        mapContext.globalAlpha = 0.5;

        // Draw the map cells
        for (y = 0; y < NUM_CELLS.y; ++y) {
            for (x = 0; x < NUM_CELLS.x; ++x) {
                cell = this.grid[y][x];
                xx = x * MAP_CELL_SIZE;
                yy = y * MAP_CELL_SIZE;

                switch (cell.type) {
                    case CELL_TYPES.nothing: color = this.mapColors.nothing; break;
                    case CELL_TYPES.empty: color = this.mapColors.empty; break;
                    case CELL_TYPES.wall: color = this.mapColors.wall; break;
                }

                if (cell.type !== CELL_TYPES.nothing) {
                    mapContext.fillStyle = color;
                    mapContext.fillRect(xx, yy, MAP_CELL_SIZE, MAP_CELL_SIZE);
                }
            }
        }

        // Draw the player
        mapContext.beginPath();
        mapContext.strokeStyle = "#ff0000";
        mapContext.lineWidth = 3;
        mapContext.arc(px, py, 3, 0, 2 * Math.PI, false);
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
        level.generateFeatures();
        level.generateMinimap();
        level.generateGeometry();
        console.info("Level generation completed.");
        level.debugPrint("grid");
    })(this);

}


// ----------------------------------------------------------------------------
// Cell  
// ----------------------------------------------------------------------------
function Cell(x, y, type) {
    this.type = type;
}
