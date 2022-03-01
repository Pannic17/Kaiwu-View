import * as THREE from "three";
import {initRenderer, initCanvas, initStats, initAmbient, initScene, initShadow} from "./InitHelper";
import {settingGUI, toneMappingOptions} from "./GUIHelper";
import {CameraHelper} from "./CameraHelper";
import {LightHelper} from "./LightHelper";
import {PMREMGenerator} from "./Postproceesing/PMREMGenerator";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {RoughnessMipmapper} from "three/examples/jsm/utils/RoughnessMipmapper.js";
import {GUI} from "three/examples/jsm/libs/lil-gui.module.min";
import {saveAs} from 'file-saver';
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {PostHelper} from "./PostHelper";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass";
import {GammaCorrectionShader} from "three/examples/jsm/shaders/GammaCorrectionShader";

let renderer, composer, scene, camera, canvas, gui;

class ThreeHelper {
    constructor( parameters, type, state) {
        this.parameters = parameters;
        this.originalCamera = parameters.camera;
        this.originalRotation = parameters.rotation;
        this.initThree( this.parameters, type, state );
        window.addEventListener ( 'resize', this.onWindowResize );
        if (this.isMobile ()) {
            gui.close ();
        }
    }



    initThree ( parameters, type, state ){
        console.log(parameters);
        console.log(type);
        console.log(state)
        let _this = this;
        if ( !parameters || (parameters === {}) ){
            console.log('Use Preset')
            parameters = PRESET;
        } else if ( type === 0 ) {
            console.log('Use Preset')
            parameters = PRESET;
        } else if ( type === 1 ) {
            console.log('Load COStorage')
        } else if ( type === 2 ) {
            console.log('Imported JSON')
        } else if ( type === 3 ) {
            console.log('Use Local')
        }
        this.renderer = renderer = initRenderer();
        this.canvas = canvas = initCanvas( renderer );
        // this.stats = initStats();
        // canvas.appendChild( this.stats.dom );
        this.scene = scene = initScene();
        console.log( scene );
        this.ambient = initAmbient( parameters );
        scene.add( this.ambient );
        initShadow( renderer );
        this.initGUI( parameters, state );
        //this.initViewGUI( parameters, state );

        // addPlane( scene );
        // addTestObjects( scene );
        this.complex = new CameraHelper( scene, canvas, gui, parameters );
        this.camera = camera = this.complex.getCamera();
        this.control = this.complex.getControl();
        this.lights = new LightHelper( scene, gui, parameters );

        this.initPost( parameters );

        console.log('Scene Loaded')

        this.pmrem = new PMREMGenerator( renderer );


        gui.destroy();
        new RGBELoader()
            .load( parameters.hdrPath, function ( texture ) {
                // texture.mapping = THREE.EquirectangularReflectionMapping;
                _this.hdr = texture;
                let hdrTexture = _this.pmrem.fromEquirectangular(texture, parameters.hdrAngle ).texture
                scene.environment = hdrTexture;
                // scene.background = hdrTexture;
                scene.fog = new THREE.Fog(0xaaaaaa, 200, 1000);
                _this.pmrem.compileEquirectangularShader();
                const roughnessMipmapper = new RoughnessMipmapper( renderer );
                const backgroundLoader = new THREE.TextureLoader();
                /**
                 * @function Background in Canvas
                 * DISCARD
                 backgroundLoader.load(
                 '/image/galaxy.jpg',
                 function ( texture ) {
                            background = texture;
                            // scene.background = background;
                            // backgroundFit( background );
                        });
                 */

                const loader = new GLTFLoader();
                if ( parameters.modelPath ){
                    loader.load(
                        parameters.modelPath,
                        function (gltf) {
                            _this.object = new THREE.Group();
                            // let meshGUI = gui.addFolder('Meshes').close();
                            let index = 0;
                            gltf.scene.traverse( function (child) {
                                if (child instanceof THREE.Mesh) {
                                    index += 1;
                                    console.log(child.material);
                                    // noinspection JSCheckFunctionSignatures
                                    roughnessMipmapper.generateMipmaps(child.material);
                                    child.castShadow = true;
                                    child.receiveShadow = true;
                                    child.material.aoIntensity = 0;
                                    child.material.aoMap = null;
                                    /**
                                     * @function View ARM
                                     * DISCARD -> RECONSTRUCT
                                     * realized in reload
                                     parameters.maps.arm = child.material.aoMap;
                                     let viewMaterial = new THREE.MeshPhongMaterial({
                                            color: 0x0000ff,
                                            map: parameters.maps.arm
                                        })
                                     let viewMesh = new THREE.Mesh(child.geometry, viewMaterial);
                                     scene.add(viewMesh);
                                     */
                                    // const mesh = new MeshHelper( child, meshGUI, parameters, index );
                                    _this.object.add( child );
                                }
                            })
                            _this.object.rotation.y = (parameters.rotation + 180) * Math.PI / 180;
                            _this.object.position.y = 0.5;
                            scene.add(_this.object);
                            roughnessMipmapper.dispose();
                            console.log('Fully Loaded');
                            state.loaded = false;
                            animate();
                        },
                        function (xhr) { console.log("Model " + (xhr.loaded / xhr.total * 100) + '% Loaded'); },
                        function (error) { console.log('An error happened'); }
                    );
                }
                _this.pmrem.dispose();
            });

        function animate() {
            if ( parameters.autoPlay ){
                _this.object.rotation.y += 0.01;
                let degree = (_this.object.rotation.y * 180 / Math.PI) % 360 - 180;
                parameters.rotation = degree;
                // console.log(degree)
            }
            if ( parameters.enablePostprocessing ){
                // console.log(_this.composer)
                composer.render();
            } else {
                renderer.render( scene, camera );
            }
            requestAnimationFrame(animate);
            renderer.toneMappingExposure = parameters.hdrExposure;
            // _this.stats.update();
        }
    }

    loadMesh( gltf, roughnessMipmapper, index, _this ) {
        gltf.scene.traverse( function (child) {
            index += 1;
            child.visible = false
            if (child instanceof THREE.Mesh) {
                console.log(child.material);
                // noinspection JSCheckFunctionSignatures
                roughnessMipmapper.generateMipmaps(child.material);
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.aoIntensity = 0;
                child.material.aoMap = null;
                /**
                 * @function View ARM
                 * DISCARD -> RECONSTRUCT
                 * realized in reload
                 parameters.maps.arm = child.material.aoMap;
                 let viewMaterial = new THREE.MeshPhongMaterial({
                                            color: 0x0000ff,
                                            map: parameters.maps.arm
                                        })
                 let viewMesh = new THREE.Mesh(child.geometry, viewMaterial);
                 scene.add(viewMesh);
                 */
                // const mesh = new MeshHelper( child, meshGUI, parameters, index );
                _this.object.add( child );
            }
        })
    }

    initPost( parameters ) {
        let _this = this;
        const renderSetting = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType
        };
        const renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderSetting );
        renderTarget.texture.name = 'EffectComposer.rt1';
        this.composer = composer = new EffectComposer( renderer, renderTarget );

        renderer.toneMapping = toneMappingOptions[ parameters.toneMapping ];

        let renderPass = new RenderPass( scene, camera );
        composer.addPass( renderPass );

        const postprocessing = new PostHelper( scene, composer, camera, renderer, gui, parameters );

        composer.addPass( new ShaderPass( GammaCorrectionShader ) );
        // composer.addPass( postprocessing.getFXAA() );
        // composer.addPass( postprocessing.getSSAA() );
        composer.addPass( postprocessing.getSMAA() );
    }

    initGUI( parameters, state ) {
        let _this = this;
        this.gui = gui = new GUI();
        let original = parameters.camera;
        let button = {
            'setting': saveSetting,
            'reset': _this.resetObject,
            'background': changeBackground,
            'rotation': parameters.rotation,
            'url': ''
        }
        function saveSetting() {
            _this.complex.logCamera( parameters, camera, _this.control );
            button.rotation = parameters.rotation;
            original = parameters.camera;
            _this.save2JSON( parameters );
        }

        function changeBackground() {
            state.background = parameters.bgPath = button.url
        }

        const controlGUI = gui.addFolder('Control');
        controlGUI.add( parameters, 'autoPlay').name('Auto Play');
        /**
         * @function Y-Axis Rotation
         * DISCARD -> UNEXPOSED
         * do not allow user to manipulate object attributes
        controlGUI.add( parameters, 'rotation', -180, 180).name('Y-Axis Rotation').onChange(
            function (value) {
                _this.object.rotation.y = ( value + 180 ) * Math.PI / 180;
            }
        ).listen();
         */
        controlGUI.add( button, 'setting').name('Save Settings');
        controlGUI.add( button, 'reset').name('Reset Object');
        controlGUI.add( parameters, 'hdrAngle', -360, 360).name('HDR Angle').onChange(
            function (value) {
                let radians = value * Math.PI / 180
                let hdrTexture = _this.pmrem.fromEquirectangular( _this.hdr, radians ).texture;
                scene.environment = hdrTexture;
                // scene.background = hdrTexture;
            }
        );
        controlGUI.add( button, 'url' ).name('Background URL')
        controlGUI.add( button, 'background' ).name('Change Background')

        settingGUI( gui, parameters, renderer, this.ambient );

        gui.open();
    }

    initViewGUI( parameters, state ) {
        let _this = this;
        let viewGUI = new GUI();
        let original = parameters.camera;
        let button = {
            'reset': _this.resetObject,
            'rotation': parameters.rotation
        }

        viewGUI.add( parameters, 'autoPlay').name('Auto Play');
        viewGUI.add( button, 'reset').name('Reset Object');
        viewGUI.add( parameters, 'enablePostprocessing').name('Postprocssing');
    }

    autoplayDisplay() {
        this.parameters.autoPlay = !this.parameters.autoPlay;
    }

    switchDisplay() {
        this.parameters.enablePostprocessing = !this.parameters.enablePostprocessing;
    }

    resetObject() {
        this.parameters.rotation = this.originalRotation;
        this.object.rotation.y = (this.originalRotation + 180) * Math.PI / 180;
        camera.position.set( this.originalCamera.position.x, this.originalCamera.position.y, this.originalCamera.position.z );
        camera.rotation.set( this.originalCamera.rotation.x, this.originalCamera.rotation.y, this.originalCamera.rotation.z )
        camera.lookAt( this.originalCamera.lookAt.x, this.originalCamera.lookAt.y, this.originalCamera.lookAt.z );
    }

    save2JSON( parameters ) {
        let data = JSON.stringify(parameters, undefined, 4);
        let bolb = new Blob([data], {type: 'text/json'});
        saveAs( bolb, "parameters.json" );
    }

    onWindowResize() {
        let focalLength = camera.getFocalLength();
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.setFocalLength(focalLength);
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        composer.setSize( window.innerWidth, window.innerHeight );
        // backgroundFit( background );
    }

    isMobile() {
        return navigator.userAgent.match (/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i);
    }

    backgroundFit( texture ) {
        const targetAspect = window.innerWidth / window.innerHeight;
        const imageAspect = texture.image.width / texture.image.height;
        const factor = imageAspect / targetAspect;
        scene.background.offset.x = factor > 1 ? (1 - 1 / factor) / 2 : 0;
        scene.background.repeat.x = factor > 1 ? 1 / factor : 1;
        scene.background.offset.y = factor > 1 ? 0 : (1 - factor) / 2;
        scene.background.repeat.y = factor > 1 ? 1 : factor;
    }
}

const PRESET = {
    modelPath: '/model/owl_gltf/1.gltf',
    hdrPath: '/hdr/xmas.hdr',
    bgPath: null,
    rotation: 0,
    hdrAngle: 0,
    autoPlay: false,
    ambientIntensity: 0.2,
    hdrExposure: 1.0,
    enablePostprocessing: true,
    toneMapping: 'ACESFilmic',
    maps: {
        arm: null,
        env: null,
    },
    postprocessing: {
        "enable": {
            "BLOOM": false,
            "SSR": true,
            "SSAO": true,
            "FXAA": false,
            "SMAA": false,
            "SSAA": true,
            "SHARP": true,
        },
        "SSAA": {
            "sampleLevel": 3,
            "unbiased": true
        },
        "BLOOM": {
            "strength": 1.5,
            "radius": 4,
            "threshold": 1
        },
        "SSAO": {
            "output": 0,
            "kernelRadius": 0.75,
            "minDistance": 0.00001,
            "maxDistance": 0.001,
            "contrast": 1
        },
        "SSR": {
            "output": 0,
            "thickness": 0.1,
            "maxDistance": 1,
            "opacity": 1,
            "surfDist": 0.001
        },
        "SHARP": {
            "intensity": 0.05
        }
    },
    "camera": {
        "position": {
            "x": 0,
            "y": -1,
            "z": -15
        },
        "rotation": {
            "x": 0,
            "y": 0,
            "z": 0
        },
        "lookAt": {
            "x": 0,
            "y": 0,
            "z": 0
        },
        "focalLength": 45
    }
}

export { ThreeHelper, PRESET };
