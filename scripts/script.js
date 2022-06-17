var canvas = document.getElementById("renderCanvas");

var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
}

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false }); };
class Playground {
    static CreateScene(engine, canvas) {
        // This creates a basic Babylon Scene object (non-mesh)
        var scene = new BABYLON.Scene(engine);
        
        var camera = new BABYLON.ArcRotateCamera('Camera', Math.PI/4, Math.PI/4, 4, new BABYLON.Vector3(0, 0, 0), scene);
        // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());
        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);
        camera.wheelDeltaPercentage = 0.1
        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(2, 5, 0), scene);
        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        let maxSize = 1
        let cubes = []
        let masterCube = BABYLON.MeshBuilder.CreateBox("box", {size: maxSize})
        masterCube.setEnabled(false)
        
        function sponge(x, y, z, size, iterations) {
            if (iterations == 0) {
                let newCube = masterCube.createInstance("box")
                newCube.position.x = x
                newCube.position.y = y
                newCube.position.z = z
                newCube.scaling.x = size
                newCube.scaling.y = size
                newCube.scaling.z = size
                cubes.push(newCube)
            } else {
                let newSize = size/3
                for (let a=-1; a<2; a++) {
                    for (let b=-1; b<2; b++) {
                        for (let c=-1; c<2; c++) {
                            if ((a==0) + (b==0) + (c==0) < 2) 
                                sponge(x+newSize*a, y+newSize*b, z+newSize*c, newSize, iterations-1)
                        }
                    }
                }
            }
        }
        sponge(0, 0, 0, maxSize, 3)

        return scene;
    }
}
createScene = function () { return Playground.CreateScene(engine, engine.getRenderingCanvas()); }
window.initFunction = async function () {


    var asyncEngineCreation = async function () {
        try {
            return createDefaultEngine();
        } catch (e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            return createDefaultEngine();
        }
    }

    window.engine = await asyncEngineCreation();
    if (!engine) throw 'engine should not be null.';
    startRenderLoop(engine, canvas);
    window.scene = createScene();
};
initFunction().then(() => {
    sceneToRender = scene
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});
