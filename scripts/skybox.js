// ----------------------------------------------------------------------------
// Skybox 
// ----------------------------------------------------------------------------
function Skybox(game) {
    game.skybox = THREE.ImageUtils.loadTextureCube([
                './images/skybox/px.jpg','./images/skybox/nx.jpg',
                './images/skybox/py.jpg','./images/skybox/ny.jpg',
                './images/skybox/pz.jpg','./images/skybox/nz.jpg'
        ]);
    var shader = THREE.ShaderUtils.lib["cube"];
    shader.uniforms["tCube"].value = game.skybox;

    var material = new THREE.ShaderMaterial({
        fragmentShader  :   shader.fragmentShader,
        vertexShader    :   shader.vertexShader,
        uniforms        :   shader.uniforms,
        depthWrite      :   false,
        side            :   THREE.BackSide
    });

    var geometry    = new THREE.CubeGeometry( 1000, 1000, 1000);
    var mesh        = new THREE.Mesh(geometry, material);
    mesh.position.z += 250;
    mesh.position.x += 200;



    (function generate(skybox) {
        game.scene.add(mesh);
    })(this);
}
