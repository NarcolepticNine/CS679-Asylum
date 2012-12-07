var CELL_TYPES = {
    nothing: ' ',
    floor: 'f',
    ceil: 'c',
    f_nc: 'F',//floor without ceiling
    stair: 't',
    wall: 'w',
    column: 'o',
    window: 'i',
    bed: 'b',
    bookcase: 'a',
    clock: 'l',
    picture: 'u',
    bulletin: 'n',
    desk: 'e',
    start: 's',
    key: 'k',
    warden: 'W',
    Fdoor: 'D',
    Door: 'd',
    stop: '.',
    patrol: 'p'
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
    this.geometry = new THREE.Geometry(); // {
    //floor: [],
    //ceil: [],
    //wall: [],
    //column: [],
    //window: [],
    //bed: [],
    //bookcase: [],
    //clock: [],
    //stair: []
    //};
    this.mapCanvas = null;
    this.mapContext = null;
    this.mapColors = {};
    this.startPos = new THREE.Vector3();
    this.wardenPos = new THREE.Vector3();

    this.patrolPos = new Array(3);

    // ------------------------------------------------------------------------
    // Private constants ------------------------------------------------------
    // ------------------------------------------------------------------------
    FLOOR_TEXTURE = THREE.ImageUtils.loadTexture("images/floor_tiles.jpg"),
    CEIL_TEXTURE = THREE.ImageUtils.loadTexture("images/ceiling_tiles.jpg"),
    WALL_TEXTURE = THREE.ImageUtils.loadTexture("images/wall.jpg"),
    COLUMN_TEXTURE = THREE.ImageUtils.loadTexture("images/column.jpg"),
    STAIR_TEXTURE = THREE.ImageUtils.loadTexture("images/transparent.png"),
    TRANSPARENT_TEXTURE = THREE.ImageUtils.loadTexture("images/transparent.png"),

    FLOOR_TEXTURE.repeat = new THREE.Vector2(2, 2);
    FLOOR_TEXTURE.wrapS = THREE.RepeatWrapping;
    FLOOR_TEXTURE.wrapT = THREE.RepeatWrapping;

    // Populates grid; parse Map Array from map.js
    // -------------------------------------------------------
    this.populateGrid = function () {

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
                            case CELL_TYPES.f_nc:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.f_nc));
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
                            case CELL_TYPES.Fdoor:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.Fdoor + rows[y][t + 1][z].charAt(x)));
                                t++;
                                break;
                            case CELL_TYPES.Door:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.Door + rows[y][t + 1][z].charAt(x)));
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
                            case CELL_TYPES.picture:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.picture + rows[y][t + 1][z].charAt(x)));
                                t++;
                                break;
                            case CELL_TYPES.bulletin:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.bulletin + rows[y][t + 1][z].charAt(x)));
                                t++;
                                break;
                            case CELL_TYPES.ceil:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.ceil));
                                break;
                            case CELL_TYPES.desk:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.desk));
                                break;
                            case CELL_TYPES.warden:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.floor));
                                this.addWardenPosition(x, y, z);
                                break;
                            case CELL_TYPES.nothing:
                                this.grid[y][z][x].push(new Cell(x, y, z, CELL_TYPES.nothing));
                                break;
                            case CELL_TYPES.patrol:
                                this.patrolPos[rows[y][t + 1][z].charAt(x) - '0'] = new THREE.Vector3(x * CELL_SIZE, y, z * CELL_SIZE);
                                t++;
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
        game.objects = new Array(NUM_CELLS.y);
        game.models = new Array(NUM_CELLS.y);
        for (y = 0; y < NUM_CELLS.y; ++y) {
            this.grid[y] = new Array(NUM_CELLS.z);
            game.objects[y] = new Array(NUM_CELLS.z);
            game.models[y] = new Array(NUM_CELLS.z);
            for (z = 0; z < NUM_CELLS.z; ++z) {
                this.grid[y][z] = new Array(NUM_CELLS.x);
                game.objects[y][z] = new Array(NUM_CELLS.x);
                game.models[y][z] = new Array(NUM_CELLS.x);
                for (x = 0; x < NUM_CELLS.x; ++x) {
                    this.grid[y][z][x] = [];
                    game.objects[y][z][x] = [];
                    game.models[y][z][x] = [];
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
                            this.generateCeilingGeometry(xx, yy, zz, 'ceil');
                        }
                        else if (cell.type.charAt(0) === CELL_TYPES.f_nc) {
                            this.generateFloorGeometry(xx, yy, zz);
                        }
                        else if (cell.type.charAt(0) === CELL_TYPES.key) {
                            this.generateObjGeometry(xx, yy + 8, zz, 1, 1, 1, 0, 'obj/key.js', 'obj/key.jpg', 'key');
                            game.nextGoal[1].push(new THREE.Vector3(xx, yy / CELL_SIZE, zz));
                            game.nextGoal[1].push('Find Key');
                        } else if (cell.type.charAt(0) === CELL_TYPES.ceil) {
                            this.generateCeilingGeometry(xx, yy, zz, 'ceil2');
                        }
                        else if (cell.type.charAt(0) === CELL_TYPES.desk) {
                            this.generateDeskGeometry(xx, yy, zz);
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
                        else if (cell.type.charAt(0) === CELL_TYPES.Fdoor) {
                            this.generateFdoorGeometry(xx, yy, zz, cell.type.charAt(1));
                            game.nextGoal[2].push(new THREE.Vector3(xx, yy / CELL_SIZE, zz));
                            game.nextGoal[2].push('Escape');
                        }
                        else if (cell.type.charAt(0) === CELL_TYPES.Door) {
                            this.generateDoorGeometry(xx, yy, zz, cell.type.charAt(1));
                            if (cell.type.charAt(1) === 'q') {
                                game.nextGoal[0].push(new THREE.Vector3(xx, yy / CELL_SIZE, zz));
                                game.nextGoal[0].push('Open Door');
                            }
                        }
                        else if (cell.type.charAt(0) === CELL_TYPES.bookcase) {
                            this.generateBookCaseGeometry(xx, yy, zz, cell.type.charAt(1));
                        }
                        else if (cell.type.charAt(0) === CELL_TYPES.picture) {
                            this.generatePictureGeometry(xx, yy, zz, cell.type.charAt(1));
                        }
                        else if (cell.type.charAt(0) === CELL_TYPES.clock) {
                            this.generateClockGeometry(xx, yy, zz, cell.type.charAt(1));
                        }
                        else if (cell.type.charAt(0) === CELL_TYPES.bulletin) {
                            this.generateBulletinGeometry(xx, yy, zz, cell.type.charAt(1));
                        }
                    }
                }
            }
        }
    };

    // Generate floor geometry 
    var PLANE_GEOMETRY = new THREE.PlaneGeometry(CELL_SIZE, CELL_SIZE, 10, 10),
        BOUND_PLANE_GEOMETRY = new THREE.PlaneGeometry(CELL_SIZE, CELL_SIZE),
        FLOOR_MATERIAL = new THREE.MeshPhongMaterial({ map: FLOOR_TEXTURE });

    this.generateFloorGeometry = function (x, y, z) {
        var mesh = new THREE.Mesh(PLANE_GEOMETRY, FLOOR_MATERIAL)
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(x, y, z);
        var mesh2 = new THREE.Mesh(BOUND_PLANE_GEOMETRY, TRANSPARENT_MATERIAL)
        mesh2.rotation.x = -Math.PI / 2;
        mesh2.position.set(x, y, z);
        mesh2.name = 'floor';
        var rx = x / CELL_SIZE;
        var rz = z / CELL_SIZE;
        var ry = y / CELL_SIZE;
        game.models[ry][rz][rx].push(mesh);
        game.objects[ry][rz][rx].push(mesh2);
        //game.scene.add(mesh);
        //THREE.GeometryUtils.merge(this.geometry, mesh); //this.geometry.floor.push(mesh);
    };


    var TRANSPARENT_MATERIAL = new THREE.MeshPhongMaterial({ map: TRANSPARENT_TEXTURE });
    TRANSPARENT_MATERIAL.transparent = true;
    // Generate Obj geometyr
    this.generateObjGeometry = function (x, y, z, scalex, scaley, scalez, rot, obj, tmap, name) {
        game.numCheck++;
        var loader = new THREE.JSONLoader();
        var modelNum = game.modelNum;
        loader.load(obj, function (geometry) { createGeo(geometry, x, y, z, scalex, scaley, scalez, rot, tmap, name); modelNum.number++; });
    };

    function createGeo(geometry, x, y, z, scalex, scaley, scalez, rot, tmap, name) {
        var objMesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture(tmap) }));
        objMesh.rotation.y = rot;
        objMesh.scale.set(scalex, scaley, scalez);
        var maxX = geometry.vertices[0].x;
        var minX = geometry.vertices[0].x;
        var maxY = geometry.vertices[0].y;
        var minY = geometry.vertices[0].y;
        var maxZ = geometry.vertices[0].z;
        var minZ = geometry.vertices[0].z;

        for (var v = 0; v < geometry.vertices.length; v++) {
            if (geometry.vertices[v].x > maxX) {
                maxX = geometry.vertices[v].x;
            }
            if (geometry.vertices[v].x < minX) {
                minX = geometry.vertices[v].x;
            }
            if (geometry.vertices[v].y > maxY) {
                maxY = geometry.vertices[v].y;
            }
            if (geometry.vertices[v].y < minY) {
                minY = geometry.vertices[v].y;
            }
            if (geometry.vertices[v].z > maxZ) {
                maxZ = geometry.vertices[v].z;
            }
            if (geometry.vertices[v].z < minZ) {
                minZ = geometry.vertices[v].z;
            }
        }
        objMesh.position.set(x, y, z);
        var rx = Math.floor(Math.floor(x + scalex * (maxX + minX) / 2) / CELL_SIZE + 1 / 2);
        var rz = Math.floor(Math.floor(z + scalez * (maxZ + minZ) / 2) / CELL_SIZE + 1 / 2);
        var ry = Math.floor(Math.floor(y + scaley * (maxY + minY) / 2) / CELL_SIZE);
        game.models[ry][rz][rx].push(objMesh);
        var boundingBox = null;
        if (name !== 'mstair') {
            if (name !== 'key') {
                boundingBox = new THREE.Mesh(new THREE.CubeGeometry(scalex * (maxX - minX), scaley * (maxY - minY), scalez * (maxZ - minZ)), TRANSPARENT_MATERIAL);
            }
            else {
                boundingBox = new THREE.Mesh(new THREE.CubeGeometry(8 * scalex * (maxX - minX), 4 * scaley * (maxY - minY), scalez * (maxZ - minZ)), TRANSPARENT_MATERIAL);
            }

            boundingBox.name = name;
            boundingBox.rotation.y = rot;
            var realX = scalex * (maxX + minX) / 2 * Math.cos(rot) - scalez * (maxZ + minZ) / 2 * Math.sin(rot);
            var realZ = -scalex * (maxX + minX) / 2 * Math.sin(rot) + scalez * (maxZ + minZ) / 2 * Math.cos(rot);
            boundingBox.position.set(x + realX, y + scaley * (maxY + minY) / 2, z + realZ);
            boundingBox.model = objMesh;
            if (name === 'door') {
                boundingBox.canToggle = true;
                boundingBox.doorState = 'closed';
                boundingBox.beginRot = rot;
                if (rot > 2 * Math.PI) {
                    boundingBox.endRot = rot + Math.PI / 2;
                }
                else {
                    boundingBox.endRot = rot - Math.PI / 2;
                }
                boundingBox.canToggle = true;
                boundingBox.doorState = 'closed';
                boundingBox.halfsize = scalez * (maxZ - minZ) / 2;
            }
            if (name !== 'picture' && name !== 'bulletin' && name !== 'clock' && name !== 'window') {
                game.objects[ry][rz][rx].push(boundingBox);
            }
        }
    }

    // Generate ceiling geometry
    var CEIL_MATERIAL = new THREE.MeshPhongMaterial({ map: CEIL_TEXTURE });
    this.generateCeilingGeometry = function (x, y, z, name) {
        var mesh = new THREE.Mesh(PLANE_GEOMETRY, CEIL_MATERIAL);
        mesh.rotation.x = Math.PI / 2;
        mesh.position.set(x, y + CELL_SIZE, z);
        var mesh2 = new THREE.Mesh(BOUND_PLANE_GEOMETRY, TRANSPARENT_MATERIAL);
        mesh2.rotation.x = Math.PI / 2;
        mesh2.position.set(x, y + CELL_SIZE, z);
        mesh2.name = name;
        var rx = x / CELL_SIZE;
        var rz = z / CELL_SIZE;
        var ry = y / CELL_SIZE;
        game.models[ry][rz][rx].push(mesh);
        game.objects[ry][rz][rx].push(mesh2);
        //game.scene.add(mesh);
        //THREE.GeometryUtils.merge(this.geometry, mesh); //this.geometry.ceil.push(mesh);
    };

    this.generateDeskGeometry = function (x, y, z) {
        this.generateObjGeometry(x, y + CELL_SIZE * 0.3408594, z, 1.25, 1.25, 1.25, Math.PI / 2, 'obj/desk.js', 'obj/desk.jpg', 'model');
    }

    // Generate stair geometry
    var STAIR_GEOMETRY = new THREE.PlaneGeometry(CELL_SIZE, Math.sqrt(5) * CELL_SIZE / 2);

    var TRIANGLE_GEOMETRY_L = new THREE.Geometry();
    var v0 = new THREE.Vector3(CELL_SIZE / 2, -CELL_SIZE / 4, 0);
    var v1 = new THREE.Vector3(CELL_SIZE / 2, CELL_SIZE / 4, 0);
    var v2 = new THREE.Vector3(-CELL_SIZE / 2, -CELL_SIZE / 4, 0);
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
    v0 = new THREE.Vector3(-CELL_SIZE / 2, -CELL_SIZE / 4, 0);
    v1 = new THREE.Vector3(CELL_SIZE / 2, -CELL_SIZE / 4, 0);
    v2 = new THREE.Vector3(-CELL_SIZE / 2, CELL_SIZE / 4, 0);
    TRIANGLE_GEOMETRY_R.vertices.push(v0);
    TRIANGLE_GEOMETRY_R.vertices.push(v1);
    TRIANGLE_GEOMETRY_R.vertices.push(v2);
    TRIANGLE_GEOMETRY_R.faces.push(new THREE.Face3(0, 1, 2, new THREE.Vector3(0, 0, 1)));
    TRIANGLE_GEOMETRY_R.faceVertexUvs[0].push([
    new THREE.UV(1, 0),
    new THREE.UV(0, 0),
    new THREE.UV(0, 1)
    ]);

    var BACK_GEOMETRY = new THREE.PlaneGeometry(CELL_SIZE, CELL_SIZE / 2);

    var HCUBE_GEOMETRY = new THREE.CubeGeometry(CELL_SIZE, CELL_SIZE / 2, CELL_SIZE);


    var STAIR_MATERIAL = new THREE.MeshPhongMaterial({ map: STAIR_TEXTURE });
    STAIR_MATERIAL.transparent = true;
    this.generateStairGeometry = function (x, y, z, c) {
        var mesh = new THREE.Mesh(STAIR_GEOMETRY, STAIR_MATERIAL);//replace with real texture later
        var mesh2 = new THREE.Mesh(TRIANGLE_GEOMETRY_L, STAIR_MATERIAL);//replace with real texture later
        var mesh3 = new THREE.Mesh(TRIANGLE_GEOMETRY_R, STAIR_MATERIAL);//replace with real texture later
        mesh3.receiveShadow = true;
        var mesh4 = new THREE.Mesh(BACK_GEOMETRY, STAIR_MATERIAL);//replace with real texture later
        var mesh5 = null; //replace with real texture later
        var mesh6 = null; //replace with real texture later
        switch (c) {
            case 's':
                this.generateObjGeometry(x, y, z, 3.6275010, 1.6922263, 3.2553060, -Math.PI / 2, 'obj/stairs.js', 'obj/stairs.jpg', 'mstair');
                mesh.rotation.x = -(Math.PI - Math.atan(2));
                mesh.rotation.z = Math.PI;
                mesh.position.set(x, y + CELL_SIZE / 4, z);
                mesh2.rotation.y = -Math.PI / 2;
                mesh2.position.set(x - CELL_SIZE / 2, y + CELL_SIZE / 4, z);
                mesh3.rotation.y = Math.PI / 2;
                mesh3.position.set(x + CELL_SIZE / 2, y + CELL_SIZE / 4, z);
                mesh4.position.set(x, y + CELL_SIZE / 4, z + CELL_SIZE / 2);
                break;
            case 'n':
                this.generateObjGeometry(x - 0.01 * CELL_SIZE, y + 0.026017979 * CELL_SIZE, z + 0.37 * CELL_SIZE, 3.6275010, 1.6922263, 3.2663060, Math.PI / 2, 'obj/stairs.js', 'obj/stairs.jpg', 'mstair');
                mesh.rotation.x = -Math.atan(2);
                mesh.position.set(x, y + CELL_SIZE / 4, z);
                mesh2.rotation.y = Math.PI / 2;
                mesh2.position.set(x + CELL_SIZE / 2, y + CELL_SIZE / 4, z);
                mesh3.rotation.y = -Math.PI / 2;
                mesh3.position.set(x - CELL_SIZE / 2, y + CELL_SIZE / 4, z);
                mesh4.rotation.y = Math.PI;
                mesh4.position.set(x, y + CELL_SIZE / 4, z - CELL_SIZE / 2);
                break;
            case 'w':
                this.generateObjGeometry(x, y, z, 3.6275010, 1.6922263, 3.2553060, Math.PI, 'obj/stairs.js', 'obj/stairs.jpg', 'mstair');
                mesh.rotation.x = -Math.PI / 2;
                mesh.rotation.y = Math.PI / 2 - Math.atan(2);
                mesh.position.set(x, y + CELL_SIZE / 4, z);
                mesh.rotation.z = Math.PI / 2;
                mesh2.rotation.y = Math.PI;
                mesh2.position.set(x, y + CELL_SIZE / 4, z - CELL_SIZE / 2);
                mesh3.position.set(x, y + CELL_SIZE / 4, z + CELL_SIZE / 2);
                mesh4.rotation.y = -Math.PI / 2;
                mesh4.position.set(x - CELL_SIZE / 2, y + CELL_SIZE / 4, z);
                break;
            case 'e':
                this.generateObjGeometry(x, y, z, 3.6275010, 1.6922263, 3.2553060, 0, 'obj/stairs.js', 'obj/stairs.jpg', 'mstair');
                mesh.rotation.x = -Math.PI / 2;
                mesh.rotation.y = -(Math.PI / 2 - Math.atan(2));
                mesh.rotation.z = -Math.PI / 2;
                mesh.position.set(x, y + CELL_SIZE / 4, z);
                mesh2.position.set(x, y + CELL_SIZE / 4, z + CELL_SIZE / 2);
                mesh3.rotation.y = Math.PI;
                mesh3.position.set(x, y + CELL_SIZE / 4, z - CELL_SIZE / 2);
                mesh4.rotation.y = Math.PI / 2;
                mesh4.position.set(x + CELL_SIZE / 2, y + CELL_SIZE / 4, z);
                break;
            case '2':
                mesh.rotation.x = -(Math.PI - Math.atan(2));
                mesh.rotation.z = Math.PI;
                mesh.position.set(x, y + CELL_SIZE * 3 / 4, z);
                mesh2.rotation.y = -Math.PI / 2;
                mesh2.position.set(x - CELL_SIZE / 2, y + CELL_SIZE * 3 / 4, z);
                mesh3.rotation.y = Math.PI / 2;
                mesh3.position.set(x + CELL_SIZE / 2, y + CELL_SIZE * 3 / 4, z);
                mesh4.position.set(x, y + CELL_SIZE * 3 / 4, z + CELL_SIZE / 2);
                mesh5 = new THREE.Mesh(HCUBE_GEOMETRY, STAIR_MATERIAL);
                mesh5.position.set(x, y + CELL_SIZE / 4, z);
                break;
            case '4':
                mesh.rotation.x = -Math.atan(2);
                mesh.position.set(x, y + CELL_SIZE * 3 / 4, z);
                mesh2.rotation.y = Math.PI / 2;
                mesh2.position.set(x + CELL_SIZE / 2, y + CELL_SIZE * 3 / 4, z);
                mesh3.rotation.y = -Math.PI / 2;
                mesh3.position.set(x - CELL_SIZE / 2, y + CELL_SIZE * 3 / 4, z);
                mesh4.rotation.y = Math.PI;
                mesh4.position.set(x, y + CELL_SIZE * 3 / 4, z - CELL_SIZE / 2);
                mesh5 = new THREE.Mesh(HCUBE_GEOMETRY, STAIR_MATERIAL);
                mesh5.position.set(x, y + CELL_SIZE / 4, z);
                break;
            case '3':
                mesh.rotation.x = -Math.PI / 2;
                mesh.rotation.y = Math.PI / 2 - Math.atan(2);
                mesh.position.set(x, y + CELL_SIZE * 3 / 4, z);
                mesh.rotation.z = Math.PI / 2;
                mesh2.rotation.y = Math.PI;
                mesh2.position.set(x, y + CELL_SIZE * 3 / 4, z - CELL_SIZE / 2);
                mesh3.position.set(x, y + CELL_SIZE * 3 / 4, z + CELL_SIZE / 2);
                mesh4.rotation.y = -Math.PI / 2;
                mesh4.position.set(x - CELL_SIZE / 2, y + CELL_SIZE * 3 / 4, z);
                mesh5 = new THREE.Mesh(HCUBE_GEOMETRY, STAIR_MATERIAL);
                mesh5.position.set(x, y + CELL_SIZE / 4, z);
                break;
            case '1':
                mesh.rotation.x = -Math.PI / 2;
                mesh.rotation.y = -(Math.PI / 2 - Math.atan(2));
                mesh.rotation.z = -Math.PI / 2;
                mesh.position.set(x, y + CELL_SIZE * 3 / 4, z);
                mesh2.position.set(x, y + CELL_SIZE * 3 / 4, z + CELL_SIZE / 2);
                mesh3.rotation.y = Math.PI;
                mesh3.position.set(x, y + CELL_SIZE * 3 / 4, z - CELL_SIZE / 2);
                mesh4.rotation.y = Math.PI / 2;
                mesh4.position.set(x + CELL_SIZE / 2, y + CELL_SIZE * 3 / 4, z);
                mesh5 = new THREE.Mesh(HCUBE_GEOMETRY, STAIR_MATERIAL);
                mesh5.position.set(x, y + CELL_SIZE / 4, z);
                break;
            case '5':
                mesh6 = new THREE.Mesh(BOUND_PLANE_GEOMETRY, STAIR_MATERIAL);
                mesh6.rotation.x = -Math.PI / 2;
                mesh6.position.set(x, y + CELL_SIZE / 2, z);
                break;
        }

        mesh.name = 'stair';
        mesh2.name = 'side';
        mesh3.name = 'side';
        mesh4.name = 'side';
        if (mesh5 !== null) {
            mesh5.name = 'support';
        }
        if (mesh6 !== null) {
            mesh6.name = 'stairfloor';
        }
        var rx = x / CELL_SIZE;
        var rz = z / CELL_SIZE;
        var ry = y / CELL_SIZE;
        if (mesh6 === null) {
            game.objects[ry][rz][rx].push(mesh);
            //game.scene.add(mesh);
            //THREE.GeometryUtils.merge(this.geometry, mesh); //this.geometry.stair.push(mesh);
            game.objects[ry][rz][rx].push(mesh2);
            //game.scene.add(mesh2);
            //THREE.GeometryUtils.merge(this.geometry, mesh2); //this.geometry.stair.push(mesh2);
            game.objects[ry][rz][rx].push(mesh3);
            //game.scene.add(mesh3);
            //THREE.GeometryUtils.merge(this.geometry, mesh3); //this.geometry.stair.push(mesh3);
            game.objects[ry][rz][rx].push(mesh4);
            if (mesh5 !== null) {
                //game.scene.add(mesh4);
                //THREE.GeometryUtils.merge(this.geometry, mesh4); //this.geometry.stair.push(mesh4);
                game.objects[ry][rz][rx].push(mesh5);
            }
        }
        else {
            game.objects[ry][rz][rx].push(mesh6);
        }

    };

    var CUBOID_GEOMETRY = new THREE.CubeGeometry(CELL_SIZE * 15 / 16, CELL_SIZE, CELL_SIZE / 16, 15, 15, 1),
        BOUND_CUBOID_GEOMETRY = new THREE.CubeGeometry(CELL_SIZE * 15 / 16, CELL_SIZE, CELL_SIZE / 16);

    this.generateWindowGeometry = function (x, y, z, c) {
        switch (c) {
            case 's':
                this.generateObjGeometry(x, y + CELL_SIZE * 0.6806223, z + CELL_SIZE * 17 / 32, 0.7323325, 0.3354368, 0.3582517, -Math.PI / 2, 'obj/window-wall.js', 'obj/window.jpg', 'window-wall');
                this.generateObjGeometry(x, y + CELL_SIZE * 0.6806223, z + CELL_SIZE * 0.4878882, 0.6089207, 0.3354368, 0.3582517, -Math.PI / 2, 'obj/window.js', 'obj/window.jpg', 'window');
                break;
            case 'n':
                this.generateObjGeometry(x, y + CELL_SIZE * 0.6806223, z - CELL_SIZE * 17 / 32, 0.7323325, 0.3354368, 0.3582517, Math.PI / 2, 'obj/window-wall.js', 'obj/window.jpg', 'window-wall');
                this.generateObjGeometry(x, y + CELL_SIZE * 0.6806223, z - CELL_SIZE * 0.4878882, 0.6089207, 0.3354368, 0.3582517, Math.PI / 2, 'obj/window.js', 'obj/window.jpg', 'window');
                break;
            case 'w':
                this.generateObjGeometry(x - CELL_SIZE * 17 / 32, y + CELL_SIZE * 0.6806223, z, 0.7323325, 0.3354368, 0.3582517, Math.PI, 'obj/window-wall.js', 'obj/window.jpg', 'window-wall');
                this.generateObjGeometry(x - CELL_SIZE * 0.4878882, y + CELL_SIZE * 0.6806223, z, 0.6089207, 0.3354368, 0.3582517, Math.PI, 'obj/window.js', 'obj/window.jpg', 'window');
                break;
            case 'e':
                this.generateObjGeometry(x + CELL_SIZE * 17 / 32, y + CELL_SIZE * 0.6806223, z, 0.7323325, 0.3354368, 0.3582517, 0, 'obj/window-wall.js', 'obj/window.jpg', 'window-wall');
                this.generateObjGeometry(x + CELL_SIZE * 0.4878882, y + CELL_SIZE * 0.6806223, z, 0.6089207, 0.3354368, 0.3582517, 0, 'obj/window.js', 'obj/window.jpg', 'window');
                break;
        }
    };

    this.generateBedGeometry = function (x, y, z, c) {
        switch (c) {
            case 's':
                this.generateObjGeometry(x, y + CELL_SIZE * 0.1583751, z + CELL_SIZE / 4, 2, 2, 2, -Math.PI / 2, 'obj/bed.js', 'obj/bed.jpg', 'model');
                break;
            case 'n':
                this.generateObjGeometry(x, y + CELL_SIZE * 0.1583751, z - CELL_SIZE / 4, 2, 2, 2, Math.PI, 'obj/bed.js', 'obj/bed.jpg', 'model');
                break;
            case 'w':
                this.generateObjGeometry(x - CELL_SIZE / 4, y + CELL_SIZE * 0.1583751, z, 2, 2, 2, Math.PI, 'obj/bed.js', 'obj/bed.jpg', 'model');
                break;
            case 'e':
                this.generateObjGeometry(x + CELL_SIZE / 4, y + CELL_SIZE * 0.1583751, z, 2, 2, 2, 0, 'obj/bed.js', 'obj/bed.jpg', 'model');
                break;
        }
    };

    this.generateFdoorGeometry = function (x, y, z, c) {
        switch (c) {
            case 's':
                this.generateObjGeometry(x - CELL_SIZE * 0.2311265, y + CELL_SIZE * 0.469391, z + CELL_SIZE * 0.5101853, 0.6531679, 1.6916896, 1.8976392, -Math.PI / 2, 'obj/final-door.js', 'obj/door.jpg', 'fdoor');
                break;
            case 'n':
                this.generateObjGeometry(x + CELL_SIZE * 0.2311265, y + CELL_SIZE * 0.469391, z - CELL_SIZE * 0.5101853, 0.6531679, 1.6916896, 1.8976392, Math.PI / 2, 'obj/final-door.js', 'obj/door.jpg', 'fdoor');
                break;
            case 'w':
                this.generateObjGeometry(x - CELL_SIZE * 0.5101853, y + CELL_SIZE * 0.469391, z - CELL_SIZE * 0.2311265, 0.6531679, 1.6916896, 1.8976392, 0, 'obj/final-door.js', 'obj/door.jpg', 'fdoor');
                break;
            case 'e':
                this.generateObjGeometry(x + CELL_SIZE * 0.5101853, y + CELL_SIZE * 0.469391, z + CELL_SIZE * 0.2311265, 0.6531679, 1.6916896, 1.8976392, Math.PI, 'obj/final-door.js', 'obj/door.jpg', 'fdoor');
                break;
        }
    };

    this.generateDoorGeometry = function (x, y, z, c) {
        switch (c) {
            case 's':
                this.generateObjGeometry(x + CELL_SIZE / 32, y + CELL_SIZE * 0.5, z + CELL_SIZE / 2, 0.9689922, 1.8020047, 4.1472265, -Math.PI / 2, 'obj/door.js', 'obj/door.jpg', 'door');
                break;
            case 'n':
                this.generateObjGeometry(x - CELL_SIZE / 32, y + CELL_SIZE * 0.5, z - CELL_SIZE / 2, 0.9689922, 1.8020047, 4.1472265, Math.PI / 2, 'obj/door.js', 'obj/door.jpg', 'door');
                break;
            case 'w':
                this.generateObjGeometry(x - CELL_SIZE / 2, y + CELL_SIZE * 0.5, z + CELL_SIZE / 32, 0.9689922, 1.8020047, 4.1472265, Math.PI, 'obj/door.js', 'obj/door.jpg', 'door');
                break;
            case 'e':
            case 'q':
                this.generateObjGeometry(x + CELL_SIZE / 2, y + CELL_SIZE * 0.5, z - CELL_SIZE / 32, 0.9689922, 1.8020047, 4.1472265, 0, 'obj/door.js', 'obj/door.jpg', 'door');
                break;
            case '2':
                this.generateObjGeometry(x - CELL_SIZE / 32, y + CELL_SIZE * 0.5, z + CELL_SIZE / 2, 0.9689922, 1.8020047, 4.1472265, 4 * Math.PI + Math.PI / 2, 'obj/door.js', 'obj/door.jpg', 'door');
                break;
            case '4':
                this.generateObjGeometry(x + CELL_SIZE / 32, y + CELL_SIZE * 0.5, z - CELL_SIZE / 2, 0.9689922, 1.8020047, 4.1472265, 4 * Math.PI - Math.PI / 2, 'obj/door.js', 'obj/door.jpg', 'door');
                break;
            case '3':
                this.generateObjGeometry(x - CELL_SIZE / 2, y + CELL_SIZE * 0.5, z - CELL_SIZE / 32, 0.9689922, 1.8020047, 4.1472265, 4 * Math.PI, 'obj/door.js', 'obj/door.jpg', 'door');
                break;
            case '1':
                this.generateObjGeometry(x + CELL_SIZE / 2, y + CELL_SIZE * 0.5, z + CELL_SIZE / 32, 0.9689922, 1.8020047, 4.1472265, 4 * Math.PI + Math.PI, 'obj/door.js', 'obj/door.jpg', 'door');
                break;
        }
    };

    this.generateBookCaseGeometry = function (x, y, z, c) {
        switch (c) {
            case 'n':
                this.generateObjGeometry(x, y + CELL_SIZE / 2, z - CELL_SIZE * 0.349875, 3, 3.1256105, 3, -Math.PI / 2, 'obj/bookcase.js', 'obj/bookcase.jpg', 'model');
                break;
            case 's':
                this.generateObjGeometry(x, y + CELL_SIZE / 2, z + CELL_SIZE * 0.349875, 3, 3.1256105, 3, Math.PI / 2, 'obj/bookcase.js', 'obj/bookcase.jpg', 'model');
                break;
            case 'e':
                this.generateObjGeometry(x + CELL_SIZE * 0.349875, y + CELL_SIZE / 2, z, 3, 3.1256105, 3, Math.PI, 'obj/bookcase.js', 'obj/bookcase.jpg', 'model');
                break;
            case 'w':
                this.generateObjGeometry(x - CELL_SIZE * 0.349875, y + CELL_SIZE / 2, z, 3, 3.1256105, 3, 0, 'obj/bookcase.js', 'obj/bookcase.jpg', 'model');
                break;
        }
    };

    this.generatePictureGeometry = function (x, y, z, c) {
        switch (c) {
            case 'n':
                this.generateObjGeometry(x, y + CELL_SIZE * 1.5 / 2.5, z - CELL_SIZE * 0.4528906, .5, .5, .5, -Math.PI / 2, 'obj/picture.js', 'obj/picture.jpg', 'picture');
                break;
            case 's':
                this.generateObjGeometry(x, y + CELL_SIZE * 1.5 / 2.5, z + CELL_SIZE * 0.4528906, .5, .5, .5, Math.PI / 2, 'obj/picture.js', 'obj/picture.jpg', 'picture');
                break;
            case 'e':
                this.generateObjGeometry(x + CELL_SIZE * 0.4528906, y + CELL_SIZE * 1.5 / 2.5, z, .5, .5, .5, Math.PI, 'obj/picture.js', 'obj/picture.jpg', 'picture');
                break;
            case 'w':
                this.generateObjGeometry(x - CELL_SIZE * 0.4528906, y + CELL_SIZE * 1.5 / 2.5, z, .5, .5, .5, 0, 'obj/picture.js', 'obj/picture.jpg', 'picture');
                break;
        }
    };

    this.generateClockGeometry = function (x, y, z, c) {
        switch (c) {
            case 'n':
                this.generateObjGeometry(x, y + CELL_SIZE * 1.5 / 2, z - CELL_SIZE * 0.4562187, .5, .5, .5, -Math.PI / 2, 'obj/clock.js', 'obj/clock.jpg', 'clock');
                break;
            case 's':
                this.generateObjGeometry(x, y + CELL_SIZE * 1.5 / 2, z + CELL_SIZE * 0.4562187, .5, .5, .5, Math.PI / 2, 'obj/clock.js', 'obj/clock.jpg', 'clock');
                break;
            case 'e':
                this.generateObjGeometry(x + CELL_SIZE * 0.4562187, y + CELL_SIZE * 1.5 / 2, z, .5, .5, .5, Math.PI, 'obj/clock.js', 'obj/clock.jpg', 'clock');
                break;
            case 'w':
                this.generateObjGeometry(x - CELL_SIZE * 0.4562187, y + CELL_SIZE * 1.5 / 2, z, .5, .5, .5, 0, 'obj/clock.js', 'obj/clock.jpg', 'clock');
                break;
        }
    };

    this.generateBulletinGeometry = function (x, y, z, c) {
        switch (c) {
            case 'n':
                this.generateObjGeometry(x, y + CELL_SIZE * 1.5 / 2.5, z - CELL_SIZE * 0.4492656, .5, .5, .5, -Math.PI / 2, 'obj/bulletin-board.js', 'obj/bulletin-board.jpg', 'bulletin');
                break;
            case 's':
                this.generateObjGeometry(x, y + CELL_SIZE * 1.5 / 2.5, z + CELL_SIZE * 0.4492656, .5, .5, .5, Math.PI / 2, 'obj/bulletin-board.js', 'obj/bulletin-board.jpg', 'bulletin');
                break;
            case 'e':
                this.generateObjGeometry(x + CELL_SIZE * 0.4492656, y + CELL_SIZE * 1.5 / 2.5, z, .5, .5, .5, Math.PI, 'obj/bulletin-board.js', 'obj/bulletin-board.jpg', 'bulletin');
                break;
            case 'w':
                this.generateObjGeometry(x - CELL_SIZE * 0.4492656, y + CELL_SIZE * 1.5 / 2.5, z, .5, .5, .5, 0, 'obj/bulletin-board.js', 'obj/bulletin-board.jpg', 'bulletin');
                break;
        }
    };

    // Generate wall geometry
    // --------------------------------
    var CUBE_GEOMETRY = new THREE.CubeGeometry(CELL_SIZE * 15 / 16, CELL_SIZE, CELL_SIZE / 16, 15, 15, 1),
        BOUND_CUBE_GEOMETRY = new THREE.CubeGeometry(CELL_SIZE * 15 / 16, CELL_SIZE, CELL_SIZE / 16);
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

        var mesh2 = new THREE.Mesh(BOUND_CUBE_GEOMETRY, TRANSPARENT_MATERIAL);
        switch (c) {
            case 's':
                mesh2.position.set(x, y + CELL_SIZE / 2, z + CELL_SIZE / 2);
                mesh2.rotation.y = Math.PI;
                break;
            case 'n':
                mesh2.position.set(x, y + CELL_SIZE / 2, z - CELL_SIZE / 2);
                break;
            case 'w':
                mesh2.position.set(x - CELL_SIZE / 2, y + CELL_SIZE / 2, z);
                mesh2.rotation.y = Math.PI / 2;
                break;
            case 'e':
                mesh2.position.set(x + CELL_SIZE / 2, y + CELL_SIZE / 2, z);
                mesh2.rotation.y = -Math.PI / 2;
                break;
        }

        mesh2.name = 'wall';


        var rx = x / CELL_SIZE;
        var rz = z / CELL_SIZE;
        var ry = y / CELL_SIZE;
        game.models[ry][rz][rx].push(mesh);
        game.objects[ry][rz][rx].push(mesh2);
        //game.scene.add(mesh);
        //THREE.GeometryUtils.merge(this.geometry, mesh); // this.geometry.wall.push(mesh);
    }

    var COLUMN_GEOMETRY = new THREE.CubeGeometry(CELL_SIZE / 16, CELL_SIZE, CELL_SIZE / 16, 1, 15, 1),
        BOUND_COLUMN_GEOMETRY = new THREE.CubeGeometry(CELL_SIZE / 16, CELL_SIZE, CELL_SIZE / 16),
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

        var mesh2 = new THREE.Mesh(BOUND_COLUMN_GEOMETRY, TRANSPARENT_MATERIAL);
        switch (c) {
            case '1':
                mesh2.position.set(x - CELL_SIZE / 2, y + CELL_SIZE / 2, z - CELL_SIZE / 2);
                break;
            case '2':
                mesh2.position.set(x + CELL_SIZE / 2, y + CELL_SIZE / 2, z - CELL_SIZE / 2);
                break;
            case '3':
                mesh2.position.set(x - CELL_SIZE / 2, y + CELL_SIZE / 2, z + CELL_SIZE / 2);
                break;
            case '4':
                mesh2.position.set(x + CELL_SIZE / 2, y + CELL_SIZE / 2, z + CELL_SIZE / 2)
                break;
        }

        mesh2.name = 'column';
        var rx = x / CELL_SIZE;
        var rz = z / CELL_SIZE;
        var ry = y / CELL_SIZE;
        game.models[ry][rz][rx].push(mesh);
        game.objects[ry][rz][rx].push(mesh2);
        //game.scene.add(mesh);
        //THREE.GeometryUtils.merge(this.geometry, mesh); // this.geometry.column.push(mesh);
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
        var x, z, t, xx, zz, px, pz, py, cell, color;

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

        //// Draw the map cells
        //for (z = 0; z < NUM_CELLS.z; ++z) {
        //    for (x = 0; x < NUM_CELLS.x; ++x) {
        //        color = this.mapColors.nothing;
        //        xx = x * MAP_CELL_SIZE;
        //        zz = z * MAP_CELL_SIZE;
        //        var chosen = 0;
        //        for (t = 0; t < this.grid[ry][z][x].length; t++) {
        //            cell = this.grid[ry][z][x][t];
        //            switch (cell.type.charAt(0)) {
        //                //case CELL_TYPES.nothing: color = this.mapColors.nothing; break;
        //                //case CELL_TYPES.ceil: color = this.mapColors.ceil; break;
        //                //case CELL_TYPES.start: color = this.mapColors.floor; break;
        //                //case CELL_TYPES.floor: color = this.mapColors.floor; break;
        //                case CELL_TYPES.stair: color = this.mapColors.stair; chosen = 1; break;
        //                case CELL_TYPES.window: color = this.mapColors.window; chosen = 1; break;
        //                case CELL_TYPES.wall: color = this.mapColors.wall; chosen = 1; break;
        //            }
        //            if (chosen === 1) {
        //                break;
        //            }
        //        }
        //        if (this.grid[ry][z][x].length > 0) {
        //            mapContext.fillStyle = color;
        //            mapContext.fillRect(xx, zz, MAP_CELL_SIZE, MAP_CELL_SIZE);
        //        }
        //    }
        //}

        // Draw the player
        mapContext.beginPath();
        mapContext.strokeStyle = "#ff0000";
        mapContext.lineWidth = 3;
        mapContext.arc(px, pz, 3, 0, 2 * Math.PI, false);
        mapContext.stroke();


        if (game.warden.mesh != null) {
            wx = Math.floor(game.warden.mesh.position.x / CELL_SIZE * MAP_CELL_SIZE) + MAP_CELL_SIZE / 2;
            wz = Math.floor(game.warden.mesh.position.z / CELL_SIZE * MAP_CELL_SIZE) + MAP_CELL_SIZE / 2;
            wy = Math.floor(Math.floor(game.warden.mesh.position.y) / CELL_SIZE);
            //draw the warden
            mapContext.beginPath();
            mapContext.strokeStyle = "#00ff00";
            mapContext.lineWidth = 3;
            mapContext.arc(wx, wz, 3, 0, 2 * Math.PI, false);
            mapContext.stroke();
        }
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
