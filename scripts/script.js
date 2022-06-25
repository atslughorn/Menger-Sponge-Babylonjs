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
                newCube.scaling.x = size
                newCube.scaling.y = size
                newCube.scaling.z = size
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

        function spawnCollectibles(amount) {
            for (let i=0; i<amount; i++) {
                let newCollectible = collectible.createInstance("collectible")
                newCollectible.position.x = Math.floor(Math.random() * 9 - 4) * 30/27
                newCollectible.position.y = Math.floor(Math.random() * 9 - 4) * 30/27
                newCollectible.position.z = Math.floor(Math.random() * 9 - 4) * 30/27
                newCollectible.checkCollisions = true
                newCollectible.animations = [collectibleSpin]
                scene.beginAnimation(newCollectible, 0, 60, true)
            }
        }

        function incrementCollectibleCounter(amount) {
            collected += amount
            collectibleCounter.text = "O2: " + collected + "/" + numCollectibles
        }

        let spongeIterations = 3
        let spongeSize = 10
        let numCollectibles = 10
        let collected = 0
        let isGameOver = false

        // This creates a basic Babylon Scene object (non-mesh)
        var scene = new BABYLON.Scene(engine);
        scene.collisionsEnabled = true
        scene.gravity = new BABYLON.Vector3(0, -0.03, 0)
        
        scene.registerBeforeRender(function () {
            if (isGameOver)
                engine.dispose()
            if (camera.fuel < camera.maxFuel)
                camera.fuel += 0.5
            fuelGauge.heightInPixels = 200*camera.fuel/camera.maxFuel+1

            if (camera.oxygen <= 0) {
                let gameOver = new BABYLON.GUI.TextBlock("gameover", "GAME OVER")
                gameOver.fontSizeInPixels = 200
                mainUITexture.addControl(gameOver)
                isGameOver = true
            }
            camera.oxygen -= 0.5
            oxygenGauge.heightInPixels = 200*camera.oxygen/camera.maxOxygen+1
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
        
        var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(-1, 5.22, -2), scene)
        // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());
        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);
        camera.minZ = 0.04
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
        camera.maxOxygen = 1000
        camera.oxygen = camera.maxOxygen

        const mainUITexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI")

        const blood = new BABYLON.GUI.Image("blood", "textures/HEAL02.png")
        mainUITexture.addControl(blood)

        const visor = new BABYLON.GUI.Image("visor", "textures/A_DMG04.png")
        mainUITexture.addControl(visor)

        const fuelGaugeBorder = new BABYLON.GUI.Rectangle()
        fuelGaugeBorder.heightInPixels = 200*camera.fuel/camera.maxFuel+1
        fuelGaugeBorder.widthInPixels = 100
        fuelGaugeBorder.leftInPixels = 100
        fuelGaugeBorder.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
        fuelGaugeBorder.topInPixels = -100
        fuelGaugeBorder.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
        mainUITexture.addControl(fuelGaugeBorder)

        const fuelGauge = new BABYLON.GUI.Rectangle()
        fuelGauge.widthInPixels = 100
        fuelGauge.leftInPixels = 100
        fuelGauge.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
        fuelGauge.topInPixels = -100
        fuelGauge.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
        fuelGauge.background="rgb(50,0,0)"
        mainUITexture.addControl(fuelGauge)

        const fuelGaugeLabel = new BABYLON.GUI.TextBlock("fuelGaugeLabel", "FUEL")
        fuelGaugeLabel.color = "white"
        fuelGaugeLabel.resizeToFit = true
        fuelGaugeLabel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
        fuelGaugeLabel.leftInPixels = 125
        fuelGaugeLabel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
        fuelGaugeLabel.topInPixels = -100
        mainUITexture.addControl(fuelGaugeLabel)

        const oxygenGaugeBorder = new BABYLON.GUI.Rectangle()
        oxygenGaugeBorder.heightInPixels = 200*camera.oxygen/camera.maxOxygen+1
        oxygenGaugeBorder.widthInPixels = 100
        oxygenGaugeBorder.leftInPixels = 250
        oxygenGaugeBorder.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
        oxygenGaugeBorder.topInPixels = -100
        oxygenGaugeBorder.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
        mainUITexture.addControl(oxygenGaugeBorder)

        const oxygenGauge = new BABYLON.GUI.Rectangle()
        oxygenGauge.widthInPixels = 100
        oxygenGauge.leftInPixels = 250
        oxygenGauge.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
        oxygenGauge.topInPixels = -100
        oxygenGauge.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
        oxygenGauge.background="rgb(0,0,128)"
        mainUITexture.addControl(oxygenGauge)

        const oxygenGaugeLabel = new BABYLON.GUI.TextBlock("oxygenGaugeLabel", "O2")
        oxygenGaugeLabel.color = "white"
        oxygenGaugeLabel.resizeToFit = true
        oxygenGaugeLabel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
        oxygenGaugeLabel.leftInPixels = 285
        oxygenGaugeLabel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
        oxygenGaugeLabel.topInPixels = -100
        mainUITexture.addControl(oxygenGaugeLabel)

        const collectibleCounter = new BABYLON.GUI.TextBlock("collectibleCounter", "")
        collectibleCounter.color = "white"
        collectibleCounter.resizeToFit = true
        collectibleCounter.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
        collectibleCounter.leftInPixels = 100
        collectibleCounter.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP
        collectibleCounter.topInPixels = 100
        mainUITexture.addControl(collectibleCounter)
        incrementCollectibleCounter(0)

        const spongeMaterial = new BABYLON.StandardMaterial("spongeMaterial", scene)
        spongeMaterial.diffuseTexture = new BABYLON.Texture("textures/flesh.jpg", scene)
        spongeMaterial.bumpTexture = new BABYLON.Texture("textures/flesh-normal.jpg", scene)

        const collectibleMaterial = new BABYLON.StandardMaterial("collectibleMaterial", scene)
        // collectibleMaterial.diffuseTexture = new BABYLON.Texture("https://i0.wp.com/www.freedomwelding.net/wp-content/uploads/2017/03/iStock-510611430.jpg", scene)
        collectibleMaterial.bumpTexture = new BABYLON.Texture("textures/metal-normal.jpg", scene)
        collectibleMaterial.diffuseColor = new BABYLON.Color3(0,0,0.5)

        const background = new BABYLON.PhotoDome("spaceTexture", "textures/nebula.png", { resolution: 32, size: 1000 }, scene)

        camera.inputs.add(new FirstPersonCameraKeyboardInput())

        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(2, 5, 0), scene);
        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        let masterCube = BABYLON.MeshBuilder.CreateBox("box")
        masterCube.setEnabled(false)
        masterCube.material = spongeMaterial

        let collectibleSpin = new BABYLON.Animation("collectibleSpin", "rotation.y", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE)
        collectibleSpin.setKeys([
            {frame:0, value: 0},
            {frame: 60, value: 2 * Math.PI}
        ])

        let collectible = BABYLON.MeshBuilder.CreateCylinder("collectible", {height: 5/27, diameter: 2.5/27})
        collectible.rotation.x = Math.PI/4
        collectible.setEnabled(false)
        collectible.material = collectibleMaterial

        camera.onCollide = function (mesh) {
            if (mesh.name == "collectible") {
                incrementCollectibleCounter(1)
                camera.oxygen += camera.maxOxygen * 0.2
                if (camera.oxygen > camera.maxOxygen)
                    camera.oxygen = camera.maxOxygen
                mesh.dispose()
            }
        }

        sponge(0, 0, 0, spongeSize, spongeIterations) 
        spawnCollectibles(numCollectibles)

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
