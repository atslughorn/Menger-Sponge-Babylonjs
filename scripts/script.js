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

        function sponge(x, y, z, size, iterations) {
            if (iterations == 0) {
                let newCube = masterCube.createInstance("box")
                newCube.position.x = x
                newCube.position.y = y
                newCube.position.z = z
                newCube.scaling.x = size*1.05
                newCube.scaling.y = size*1.05
                newCube.scaling.z = size*1.05
                newCube.checkCollisions = true
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

        // This creates a basic Babylon Scene object (non-mesh)
        var scene = new BABYLON.Scene(engine);
        scene.collisionsEnabled = true
        scene.gravity = new BABYLON.Vector3(0, -0.03, 0)
        
        var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(-1, 5.22, -2), scene)
        // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());
        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);
        camera.minZ = 0.05
        camera.speed = 0.002
        camera.intertia = 0
        camera.checkCollisions = true
        camera.ellipsoid = new BABYLON.Vector3(0.06, 0.1, 0.06)
        camera.applyGravity = true
        camera._needMoveForGravity = true
        camera.keysUp = [87]; // W
        camera.keysDown = [83]; // S
        camera.keysLeft = [65]; // A
        camera.keysRight = [68]; // D
        camera.angle = Math.PI/2
        camera.direction = new BABYLON.Vector3(Math.cos(camera.angle), 0, Math.sin(camera.angle))
        camera.inputs.removeByType("FreeCameraKeyboardMoveInput")
        camera.maxFuel = 100
        camera.fuel = camera.maxFuel

        const mainUITexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI")
        const fuelGauge = new BABYLON.GUI.Rectangle()
        fuelGauge.widthInPixels = 100
        fuelGauge.leftInPixels = 100
        fuelGauge.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
        fuelGauge.topInPixels = -100
        fuelGauge.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
        fuelGauge.background="black"
        mainUITexture.addControl(fuelGauge)

        scene.registerBeforeRender(function () {
            if (camera.fuel < camera.maxFuel)
                camera.fuel += 0.5
            fuelGauge.heightInPixels = 200*camera.fuel/camera.maxFuel+1
        })

        scene.onPointerDown = () => {
            if(!scene.alreadyLocked) canvas.requestPointerLock();
          }
        
          document.addEventListener("pointerlockchange", () => {
            var element = document.pointerLockElement || null
            if(element){ scene.alreadyLocked = true } else { scene.alreadyLocked = false}
          })
          document.addEventListener("mozpointerlockchange", () => {
            var element = document.pointerLockElement || null
            if(element){ scene.alreadyLocked = true } else { scene.alreadyLocked = false}
          })
        
          document.addEventListener("webkitpointerlockchange", () => {
            var element = document.pointerLockElement || null
            if(element){ scene.alreadyLocked = true } else { scene.alreadyLocked = false}
          })

        let FirstPersonCameraKeyboardInput = function() {
            this._keys = []
            this.keysUp = [87] // W
            this.keysDown = [83] // A
            this.keysLeft = [65] // S
            this.keysRight = [68] // D
            this.keysSpace = [32] // Spacebar
        }

        FirstPersonCameraKeyboardInput.prototype.getClassName = function() {
            return "FirstPersonCameraKeyboardInput"
        }

        FirstPersonCameraKeyboardInput.prototype.getSimpleName = function() {
            return "firstPersonCamera"
        }

        FirstPersonCameraKeyboardInput.prototype.attachControl = function(noPreventDefault) {
            let _this = this;
            let engine = this.camera.getEngine();
            let element = engine.getInputElement();
            if (!this._onKeyDown) {
                element.tabIndex = 1
                this._onKeyDown = function (evt) {
                    if (_this.keysLeft.indexOf(evt.keyCode) !== -1 ||
                        _this.keysRight.indexOf(evt.keyCode) !== -1 ||
                        _this.keysUp.indexOf(evt.keyCode) !== -1 ||
                        _this.keysDown.indexOf(evt.keyCode) !== -1 ||
                        _this.keysSpace.indexOf(evt.keyCode) !== -1) {
                        let index = _this._keys.indexOf(evt.keyCode)
                        if (index === -1) {
                            _this._keys.push(evt.keyCode)
                        }
                        if (!noPreventDefault) {
                            evt.preventDefault()
                        }
                    }
                }
                this._onKeyUp = function (evt) {
                    if (_this.keysLeft.indexOf(evt.keyCode) !== -1 ||
                        _this.keysRight.indexOf(evt.keyCode) !== -1 ||
                        _this.keysUp.indexOf(evt.keyCode) !== -1 ||
                        _this.keysDown.indexOf(evt.keyCode) !== -1 ||
                        _this.keysSpace.indexOf(evt.keyCode) !== -1) {
                        let index = _this._keys.indexOf(evt.keyCode)
                        if (index >= 0) {
                            _this._keys.splice(index, 1)
                        }
                        if (!noPreventDefault) {
                            evt.preventDefault()
                        }
                    }
                }
                element.addEventListener("keydown", this._onKeyDown, false)
                element.addEventListener("keyup", this._onKeyUp, false)
                BABYLON.Tools.RegisterTopRootEvents(canvas, [
                    { name: "blur", handler: this._onLostFocus }
                ])
            }
        }

        FirstPersonCameraKeyboardInput.prototype.checkInputs = function() {
            if (this._onKeyDown) {
                let camera = this.camera
                camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix)
                for (let i = 0; i < this._keys.length; i++) {
                    let keyCode = this._keys[i];
                    let speed = camera.speed;
                    if (this.keysLeft.indexOf(keyCode) !== -1) {
                        camera.direction.copyFromFloats(-speed, 0, 0)
                        BABYLON.Vector3.TransformNormalToRef(camera.direction, camera._cameraTransformMatrix, camera._transformedDirection)
                        camera._transformedDirection.y = 0
                    }
                    else if (this.keysUp.indexOf(keyCode) !== -1) {
                        camera.direction.copyFromFloats(0, 0, speed)
                        BABYLON.Vector3.TransformNormalToRef(camera.direction, camera._cameraTransformMatrix, camera._transformedDirection)
                        camera._transformedDirection.y = 0
                    }
                    else if (this.keysRight.indexOf(keyCode) !== -1) {
                        camera.direction.copyFromFloats(speed, 0, 0)
                        BABYLON.Vector3.TransformNormalToRef(camera.direction, camera._cameraTransformMatrix, camera._transformedDirection)
                        camera._transformedDirection.y = 0
                    }
                    else if (this.keysDown.indexOf(keyCode) !== -1) {
                        camera.direction.copyFromFloats(0, 0, -speed)
                        BABYLON.Vector3.TransformNormalToRef(camera.direction, camera._cameraTransformMatrix, camera._transformedDirection)
                        camera._transformedDirection.y = 0
                    }
                    else if (this.keysSpace.indexOf(keyCode) !== -1) {
                        if (camera.fuel > 0) {
                            camera._transformedDirection = new BABYLON.Vector3(0,camera.speed-0.08*scene.gravity.y, 0)
                            camera.fuel--
                        }
                        else {
                            camera._transformedDirection = BABYLON.Vector3.Zero()
                        }
                    }
                    if (camera.getScene().useRightHandedSystem) {
                        camera.direction.z *= -1
                    }
                    // let length = camera._transformedDirection.length()
                    // camera._transformedDirection.normalizeFromLength(length)
                    // camera._transformedDirection = camera._transformedDirection.normalize().scale(camera._transformedDirection.length())
                    camera.cameraDirection.addInPlace(camera._transformedDirection)
                }
            }
        }
        
        camera.inputs.add(new FirstPersonCameraKeyboardInput())

        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(2, 5, 0), scene);
        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        let maxSize = 10
        let masterCube = BABYLON.MeshBuilder.CreateBox("box")
        masterCube.setEnabled(false)

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
