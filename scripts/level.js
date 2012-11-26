var CELL_TYPES = {
    nothing: ' ',
    floor: 'f',
    ceil: 'c',
    stair: 't',
    wall: 'w',
    column: 'o',
    window: 'i',
    bed: 'b',
    bookcase: 'a',
    clock: 'l',
    start: 's',
    key: 'k',
    warden: 'W',
    stop: '.'
},
    MAP_CELL_SIZE = 10,
    CELL_SIZE = 32,
    rows,
    NUM_CELLS = new THREE.Vector3(0, 0, 0);

NUM_CELLS.y = numFloors;
rows = new Array(numFloors);
for (y = 0; y < numFloors; ++y) {
    //break apart map[i] into rows on \n
    rows[y] = new Array(Map[y].length);
    for (var t = 0; t < Map[y].length; t++) {
        rows[y][t] = Map[y][t].split("\n");
    }
    NUM_CELLS.z = NUM_CELLS.z > rows[y][0].length ? NUM_CELLS.z : rows[y][0].length;
    for (z = 0; z < NUM_CELLS.z; ++z) {
        NUM_CELLS.x = NUM_CELLS.x > rows[y][0][z].length ? NUM_CELLS.x : rows[y][0][z].length;
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
        wall: [],
        column: [],
        window: [],
        bed: [],
        bookcase: [],
        clock: [],
        stair: []
    };
    this.mapCanvas = null;
    this.mapContext = null;
    this.mapColors = {};
    this.startPos = new THREE.Vector3();
    this.wardenPos = new THREE.Vector3();

    // ------------------------------------------------------------------------
    // Private constants ------------------------------------------------------
    // ------------------------------------------------------------------------
    FLOOR_TEXTURE = THREE.ImageUtils.loadTexture("images/floor_tiles.jpg"),
    CEIL_TEXTURE = THREE.ImageUtils.loadTexture("images/ceiling_tiles.jpg"),
    WALL_TEXTURE = THREE.ImageUtils.loadTexture("images/wall.jpg"),
    COLUMN_TEXTURE = THREE.ImageUtils.loadTexture("images/stair.png"),//replace it later
    STAIR_TEXTURE = THREE.ImageUtils.loadTexture("images/stair.png"),
    TRANSPARENT_TEXTURE = THREE.ImageUtils.loadTexture("images/window_wall.png"),

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
            for (var z = 0; z < rows[y][0].length; z++) {
                for (var x = 0; x < rows[y][0][z].length; x++) {
                    for (var t = 0; t < rows[y].length; t++) {
                        var stop = 0;
                        switch (rows[y][t][z].charAt(x)) {
                            case CELL_TYPES.wall:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.wall + rows[y][t + 1][z].charAt(x)));
                                t++;
                                break;
                            case CELL_TYPES.column:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.column + rows[y][t + 1][z].charAt(x)));
                                t++;
                                break;
                            case CELL_TYPES.start:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.floor));
                                this.addStartPosition(x, y, z);
                                break;
                            case CELL_TYPES.key:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.key));
                                break;
                            case CELL_TYPES.floor:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.floor));
                                break;
                            case CELL_TYPES.stair:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.stair + rows[y][t + 1][z].charAt(x)));
                                t++;
                                break;
                            case CELL_TYPES.window:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.window + rows[y][t + 1][z].charAt(x)));
                                t++;
                                break;
                            case CELL_TYPES.bed:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.bed + rows[y][t + 1][z].charAt(x)));
                                t++;
                                break;
                            case CELL_TYPES.bookcase:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.bookcase + rows[y][t + 1][z].charAt(x)));
                                t++;
                                break;
                            case CELL_TYPES.clock:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.clock + rows[y][t + 1][z].charAt(x)));
                                t++;
                                break;
                            case CELL_TYPES.ceil:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.ceil));
                                break;
                            case CELL_TYPES.warden:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.floor));
                                this.addWardenPosition(x, y, z);
                                break;
                            case CELL_TYPES.nothing:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.nothing));
                                break;
                            case CELL_TYPES.stop:
                                stop = 1;
                                break;
                        }
                        if (stop === 1) {
                            break;
                        }
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
                    this.grid[y][z][x] = []
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
            str += "Floor " + y + ":\n";
            for (z = 0; z < NUM_CELLS.z; ++z) {
                for (x = 0; x < NUM_CELLS.x; ++x) {
                    for (var t = 0; t < this.grid[y][z][x].length; t++) {
                        str += this.grid[y][z][x][t].type.charAt(0);
                    }
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
        var x, y, z, t, xx, yy, zz, cell;

        for (y = 0; y < NUM_CELLS.y; ++y) {
            for (z = 0; z < NUM_CELLS.z; ++z) {
                for (x = 0; x < NUM_CELLS.x; ++x) {
                    for (t = 0; t < this.grid[y][z][x].length; t++) {
                        cell = this.grid[y][z][x][t];
                        xx = x * CELL_SIZE;
                        yy = y * CELL_SIZE;
                        zz = z * CELL_SIZE;
                        // Generate geometry according to cell type
                        if (cell.type.charAt(0) === CELL_TYPES.nothing) {
                            continue;
                        } else if (cell.type.charAt(0) === CELL_TYPES.floor) {
                            this.generateFloorGeometry(xx, yy, zz);
                            this.generateCeilingGeometry(xx, yy, zz);
                        } else if (cell.type.charAt(0) === CELL_TYPES.key) {
                            this.generateObjGeometry(xx, yy + 8, zz, .5, 0, 'obj/key.js', 'obj/key.jpg');
                        } else if (cell.type.charAt(0) === CELL_TYPES.ceil) {
                            this.generateCeilingGeometry(xx, yy, zz);
                        }
                        else if (cell.type.charAt(0) === CELL_TYPES.stair) {
                            this.generateStairGeometry(xx, yy, zz, cell.type.charAt(1));
                        }
                        else if (cell.type.charAt(0) === CELL_TYPES.window) {
                            this.generateWindowGeometry(xx, yy, zz, cell.type.charAt(1));
                        } else if (cell.type.charAt(0) === CELL_TYPES.wall) {
                            this.generateWallGeometry(xx, yy, zz, cell.type.charAt(1));
                        }
                        else if (cell.type.charAt(0) === CELL_TYPES.column) {
                            this.generateColumnGeometry(xx, yy, zz, cell.type.charAt(1));
                        }
                        else if (cell.type.charAt(0) === CELL_TYPES.bed) {
                            this.generateBedGeometry(xx, yy, zz, cell.type.charAt(1));
                        }
                        else if (cell.type.charAt(0) === CELL_TYPES.bookcase) {
                            this.generateBookCaseGeometry(xx, yy, zz, cell.type.charAt(1));
                        }
                        else if (cell.type.charAt(0) === CELL_TYPES.clock) {
                            this.generateClockGeometry(xx, yy, zz, cell.type.charAt(1));
                        }
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
        mesh.name = 'floor';
        game.objects.push(mesh);
        game.scene.add(mesh);
        this.geometry.floor.push(mesh);
    };

    // Generate Obj geometyr
    this.generateObjGeometry = function (x, y, z, scale, rot, obj, tmap) {
        var loader = new THREE.JSONLoader();
        var cbo = function (geometry) { createGeo(geometry, x, y, z, scale, rot, tmap) };
        loader.load(obj, cbo);
    };

    function createGeo(geometry, x, y, z, scale, rot, tmap) {
        var objMesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture(tmap) }));
        objMesh.name = 'model';
        objMesh.rotation.y = rot;
        objMesh.position.set(x, y, z);        
        objMesh.scale.set(scale, scale, scale);           
        game.scene.add(objMesh);
    }

    // Generate ceiling geometry
    var CEIL_MATERIAL = new THREE.MeshPhongMaterial({ map: CEIL_TEXTURE });
    this.generateCeilingGeometry = function (x, y, z) {
        var mesh = new THREE.Mesh(PLANE_GEOMETRY, CEIL_MATERIAL);
        mesh.rotation.x = Math.PI / 2;
        mesh.position.set(x, y + CELL_SIZE, z);
        mesh.name = 'ceiling';
        game.objects.push(mesh);
        game.scene.add(mesh);
        this.geometry.ceil.push(mesh);
    };

    // Generate stair geometry
    var STAIR_GEOMETRY = new THREE.PlaneGeometry(CELL_SIZE, Math.sqrt(2) * CELL_SIZE);

    var TRIANGLE_GEOMETRY_L = new THREE.Geometry();
    var v0 = new THREE.Vector3(CELL_SIZE / 2, -CELL_SIZE / 2, 0);
    var v1 = new THREE.Vector3(CELL_SIZE / 2, CELL_SIZE / 2, 0);
    var v2 = new THREE.Vector3(-CELL_SIZE / 2, -CELL_SIZE / 2, 0);
    TRIANGLE_GEOMETRY_L.vertices.push(v0);
    TRIANGLE_GEOMETRY_L.vertices.push(v1);
    TRIANGLE_GEOMETRY_L.vertices.push(v2);
    TRIANGLE_GEOMETRY_L.faces.push(new THREE.Face3(0, 1, 2, new THREE.Vector3(0, 0, 1)));
    TRIANGLE_GEOMETRY_L.faceVertexUvs[0].push([
    new THREE.UV(0, 0),
    new THREE.UV(1, 1),
    new THREE.UV(1, 0)
    ]);

    var TRIANGLE_GEOMETRY_R = new THREE.Geometry();
    THREE.Geometry.call(TRIANGLE_GEOMETRY_R);
    v0 = new THREE.Vector3(-CELL_SIZE / 2, -CELL_SIZE / 2, 0);
    v1 = new THREE.Vector3(CELL_SIZE / 2, -CELL_SIZE / 2, 0);
    v2 = new THREE.Vector3(-CELL_SIZE / 2, CELL_SIZE / 2, 0);
    TRIANGLE_GEOMETRY_R.vertices.push(v0);
    TRIANGLE_GEOMETRY_R.vertices.push(v1);
    TRIANGLE_GEOMETRY_R.vertices.push(v2);
    TRIANGLE_GEOMETRY_R.faces.push(new THREE.Face3(0, 1, 2, new THREE.Vector3(0, 0, 1)));
    TRIANGLE_GEOMETRY_R.faceVertexUvs[0].push([
    new THREE.UV(1, 0),
    new THREE.UV(0, 0),
    new THREE.UV(0, 1)
    ]);

    var BACK_GEOMETRY = new THREE.PlaneGeometry(CELL_SIZE, CELL_SIZE);

    var STAIR_MATERIAL = new THREE.MeshPhongMaterial({ map: STAIR_TEXTURE });
    this.generateStairGeometry = function (x, y, z, c) {
        var mesh = new THREE.Mesh(STAIR_GEOMETRY, STAIR_MATERIAL);//replace with real texture later
        var mesh2 = new THREE.Mesh(TRIANGLE_GEOMETRY_L, STAIR_MATERIAL);//replace with real texture later
        var mesh3 = new THREE.Mesh(TRIANGLE_GEOMETRY_R, STAIR_MATERIAL);//replace with real texture later
        mesh3.receiveShadow = true;
        var mesh4 = new THREE.Mesh(BACK_GEOMETRY, STAIR_MATERIAL);//replace with real texture later
        switch (c) {
            case 's':
                mesh.rotation.x = -Math.PI * 3 / 4;
                mesh.rotation.z = Math.PI;
                mesh2.rotation.y = -Math.PI / 2;
                mesh2.position.set(x - CELL_SIZE / 2, y + CELL_SIZE / 2, z);
                mesh3.rotation.y = Math.PI / 2;
                mesh3.position.set(x + CELL_SIZE / 2, y + CELL_SIZE / 2, z);
                mesh4.position.set(x, y + CELL_SIZE / 2, z + CELL_SIZE / 2);
                break;
            case 'n':
                mesh.rotation.x = -Math.PI / 4;
                mesh2.rotation.y = Math.PI / 2;
                mesh2.position.set(x + CELL_SIZE / 2, y + CELL_SIZE / 2, z);
                mesh3.rotation.y = -Math.PI / 2;
                mesh3.position.set(x - CELL_SIZE / 2, y + CELL_SIZE / 2, z);
                mesh4.rotation.y = Math.PI;
                mesh4.position.set(x, y + CELL_SIZE / 2, z - CELL_SIZE / 2);
                break;
            case 'w':
                mesh.rotation.x = -Math.PI / 2;
                mesh.rotation.y = Math.PI / 4;
                mesh.rotation.z = Math.PI / 2;
                mesh2.rotation.y = Math.PI;
                mesh2.position.set(x, y + CELL_SIZE / 2, z - CELL_SIZE / 2);
                mesh3.position.set(x, y + CELL_SIZE / 2, z + CELL_SIZE / 2);
                mesh4.rotation.y = -Math.PI / 2;
                mesh4.position.set(x - CELL_SIZE / 2, y + CELL_SIZE / 2, z);
                break;
            case 'e':
                mesh.rotation.x = -Math.PI / 2;
                mesh.rotation.y = -Math.PI / 4;
                mesh.rotation.z = -Math.PI / 2;
                mesh2.position.set(x, y + CELL_SIZE / 2, z + CELL_SIZE / 2);
                mesh3.rotation.y = Math.PI;
                mesh3.position.set(x, y + CELL_SIZE / 2, z - CELL_SIZE / 2);
                mesh4.rotation.y = Math.PI / 2;
                mesh4.position.set(x + CELL_SIZE / 2, y + CELL_SIZE / 2, z);
                break;
        }

        mesh.position.set(x, y + CELL_SIZE / 2, z);
        mesh.name = 'stair';
        mesh2.name = 'side';
        mesh3.name = 'side';
        mesh4.name = 'side';
        game.objects.push(mesh);
        game.scene.add(mesh);
        this.geometry.stair.push(mesh);
        game.objects.push(mesh2);
        game.scene.add(mesh2);
        this.geometry.stair.push(mesh2);
        game.objects.push(mesh3);
        game.scene.add(mesh3);
        this.geometry.stair.push(mesh3);
        game.objects.push(mesh4);
        game.scene.add(mesh4);
        this.geometry.stair.push(mesh4);
    };

    var CUBOID_GEOMETRY = new THREE.CubeGeometry(CELL_SIZE * 15 / 16, CELL_SIZE, CELL_SIZE / 16),
    WINDOW_MATERIAL = new THREE.MeshPhongMaterial({ map: TRANSPARENT_TEXTURE });
    WINDOW_MATERIAL.transparent = true;

    this.generateWindowGeometry = function (x, y, z, c) {
        var mesh = new THREE.Mesh(CUBOID_GEOMETRY, WINDOW_MATERIAL);//replace with real texture later
        switch (c) {
            case 's':
                mesh.position.set(x, y + CELL_SIZE / 2, z + CELL_SIZE / 2);
                mesh.rotation.y = Math.PI;
                this.generateObjGeometry(x, y + CELL_SIZE * 2 / 3, z + CELL_SIZE  / 2, .5, -Math.PI / 2, 'obj/window.js', 'obj/window.jpg');
                break;
            case 'n':
                mesh.position.set(x, y + CELL_SIZE / 2, z - CELL_SIZE / 2);
                this.generateObjGeometry(x, y + CELL_SIZE * 2 / 3, z - CELL_SIZE / 2, .5, Math.PI / 2, 'obj/window.js', 'obj/window.jpg');
                break;
            case 'w':
                mesh.position.set(x - CELL_SIZE / 2, y + CELL_SIZE / 2, z);
                this.generateObjGeometry(x - CELL_SIZE / 2, y + CELL_SIZE * 2 / 3, z, .5, Math.PI, 'obj/window.js', 'obj/window.jpg');
                mesh.rotation.y = Math.PI / 2;
                break;
            case 'e':
                mesh.position.set(x + CELL_SIZE / 2, y + CELL_SIZE / 2, z);
                this.generateObjGeometry(x + CELL_SIZE / 2, y + CELL_SIZE * 2 / 3, z, .5, 0, 'obj/window.js', 'obj/window.jpg');
                mesh.rotation.y = -Math.PI / 2;
                break;
        }
        mesh.name = 'window';
        game.objects.push(mesh);
        game.scene.add(mesh);
        this.geometry.window.push(mesh);
    };

    this.generateBedGeometry = function (x, y, z, c) {
        switch (c) {
            case 's':
                this.generateObjGeometry(x, y + CELL_SIZE / 8, z + CELL_SIZE / 4, 1, -Math.PI / 2, 'obj/bed.js', 'obj/bed.jpg');
                break;
            case 'n':
                this.generateObjGeometry(x, y + CELL_SIZE / 8, z - CELL_SIZE / 4, 1, Math.PI / 2, 'obj/bed.js', 'obj/bed.jpg');
                break;
            case 'w':
                this.generateObjGeometry(x - CELL_SIZE / 4, y + CELL_SIZE / 8, z, 1, Math.PI, 'obj/bed.js', 'obj/bed.jpg');
                break;
            case 'e':
                this.generateObjGeometry(x + CELL_SIZE / 4, y + CELL_SIZE / 8, z, 1, 0, 'obj/bed.js', 'obj/bed.jpg');
                break;
        }
    };

    this.generateBookCaseGeometry = function (x, y, z, c) {
        switch (c) {
            case 'n':
                this.generateObjGeometry(x, y + CELL_SIZE / 3, z - CELL_SIZE / 3, 2, -Math.PI / 2, 'obj/bookcase.js', 'obj/bookcase.jpg');
                break;
            case 's':
                this.generateObjGeometry(x, y + CELL_SIZE / 3, z + CELL_SIZE / 3, 2, Math.PI / 2, 'obj/bookcase.js', 'obj/bookcase.jpg');
                break;
            case 'e':
                this.generateObjGeometry(x + CELL_SIZE / 3, y + CELL_SIZE / 3, z, 2, Math.PI, 'obj/bookcase.js', 'obj/bookcase.jpg');
                break;
            case 'w':
                this.generateObjGeometry(x - CELL_SIZE / 3, y + CELL_SIZE / 3, z, 2, 0, 'obj/bookcase.js', 'obj/bookcase.jpg');
                break;
        }
    };

    this.generateClockGeometry = function (x, y, z, c) {
        switch (c) {
            case 'n':
                this.generateObjGeometry(x, y + CELL_SIZE * 2 / 3, z - CELL_SIZE * 5.7 / 12, 1, -Math.PI / 2, 'obj/clock.js', 'obj/clock.jpg');
                break;
            case 's':
                this.generateObjGeometry(x, y + CELL_SIZE * 2 / 3, z + CELL_SIZE * 5.7 / 12, 1, Math.PI / 2, 'obj/clock.js', 'obj/clock.jpg');
                break;
            case 'e':
                this.generateObjGeometry(x + CELL_SIZE * 5.7 / 12, y + CELL_SIZE * 2 / 3, z, 1, Math.PI, 'obj/clock.js', 'obj/clock.jpg');
                break;
            case 'w':
                this.generateObjGeometry(x - CELL_SIZE * 5.7 / 12, y + CELL_SIZE * 2 / 3, z, 1, 0, 'obj/clock.js', 'obj/clock.jpg');
                break;
        }
    };

    // Generate wall geometry
    // --------------------------------
    var CUBE_GEOMETRY = new THREE.CubeGeometry(CELL_SIZE * 15 / 16, CELL_SIZE, CELL_SIZE / 16, 1, 1, 1, WALL_MATERIAL,
            { px: false, nx: false, py: false, ny: false, pz: true, nz: true }),//thin wall, only two sides are drawn
        WALL_MATERIAL = new THREE.MeshPhongMaterial({ map: WALL_TEXTURE });

    this.generateWallGeometry = function (x, y, z, c) {
        var mesh = new THREE.Mesh(CUBE_GEOMETRY, WALL_MATERIAL);
        switch (c) {
            case 's':
                mesh.position.set(x, y + CELL_SIZE / 2, z + CELL_SIZE / 2);
                mesh.rotation.y = Math.PI;
                break;
            case 'n':
                mesh.position.set(x, y + CELL_SIZE / 2, z - CELL_SIZE / 2);
                break;
            case 'w':
                mesh.position.set(x - CELL_SIZE / 2, y + CELL_SIZE / 2, z);
                mesh.rotation.y = Math.PI / 2;
                break;
            case 'e':
                mesh.position.set(x + CELL_SIZE / 2, y + CELL_SIZE / 2, z);
                mesh.rotation.y = -Math.PI / 2;
                break;
        }

        mesh.name = 'wall';
        game.objects.push(mesh);
        game.scene.add(mesh);
        this.geometry.wall.push(mesh);
    }

    var COLUMN_GEOMETRY = new THREE.CubeGeometry(CELL_SIZE / 16, CELL_SIZE, CELL_SIZE / 16, 1, 1, 1, COLUMN_MATERIAL,
            { px: true, nx: true, py: false, ny: false, pz: true, nz: true }),//column
        COLUMN_MATERIAL = new THREE.MeshPhongMaterial({ map: COLUMN_TEXTURE });

    this.generateColumnGeometry = function (x, y, z, c) {
        var mesh = new THREE.Mesh(COLUMN_GEOMETRY, COLUMN_MATERIAL);
        switch (c) {
            case '1':
                mesh.position.set(x - CELL_SIZE / 2, y + CELL_SIZE / 2, z - CELL_SIZE / 2);
                break;
            case '2':
                mesh.position.set(x + CELL_SIZE / 2, y + CELL_SIZE / 2, z - CELL_SIZE / 2);
                break;
            case '3':
                mesh.position.set(x - CELL_SIZE / 2, y + CELL_SIZE / 2, z + CELL_SIZE / 2);
                break;
            case '4':
                mesh.position.set(x + CELL_SIZE / 2, y + CELL_SIZE / 2, z + CELL_SIZE / 2)
                break;
        }

        mesh.name = 'column';
        game.objects.push(mesh);
        game.scene.add(mesh);
        this.geometry.column.push(mesh);
    }


    // Add starting location for player
    // -------------------------------------------
    this.addStartPosition = function (x, y, z) {
        this.startPos = new THREE.Vector3(x * CELL_SIZE, y * CELL_SIZE, z * CELL_SIZE);

    };

    this.addWardenPosition = function (x, y, z) {
        this.wardenPos = new THREE.Vector3(x * CELL_SIZE, y * CELL_SIZE, z * CELL_SIZE);

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
        this.mapColors.stair = "#ff7f00";
        this.mapColors.window = "#0000ff";
        this.mapColors.wall = "#c0c0c0";
    };

    // Update minimap
    // --------------------------------
    this.updateMinimap = function () {
        var x, z, t, xx, zz, px, pz, ry, cell, color;

        // Calculate the player's position on the minimap
        px = Math.floor(game.player.mesh.position.x / CELL_SIZE * MAP_CELL_SIZE) + MAP_CELL_SIZE / 2;
        pz = Math.floor(game.player.mesh.position.z / CELL_SIZE * MAP_CELL_SIZE) + MAP_CELL_SIZE / 2;
        ry = Math.floor(Math.floor(game.player.mesh.position.y) / CELL_SIZE);

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
                color = this.mapColors.nothing;
                xx = x * MAP_CELL_SIZE;
                zz = z * MAP_CELL_SIZE;
                var chosen = 0;
                for (t = 0; t < this.grid[ry][z][x].length; t++) {
                    cell = this.grid[ry][z][x][t];
                    switch (cell.type.charAt(0)) {
                        //case CELL_TYPES.nothing: color = this.mapColors.nothing; break;
                        //case CELL_TYPES.ceil: color = this.mapColors.ceil; break;
                        //case CELL_TYPES.start: color = this.mapColors.floor; break;
                        //case CELL_TYPES.floor: color = this.mapColors.floor; break;
                        case CELL_TYPES.stair: color = this.mapColors.stair; chosen = 1; break;
                        case CELL_TYPES.window: color = this.mapColors.window; chosen = 1; break;
                        case CELL_TYPES.wall: color = this.mapColors.wall; chosen = 1; break;
                    }
                    if (chosen === 1) {
                        break;
                    }
                }
                if (this.grid[ry][z][x].length > 0) {
                    mapContext.fillStyle = color;
                    mapContext.fillRect(xx, zz, MAP_CELL_SIZE, MAP_CELL_SIZE);
                }
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