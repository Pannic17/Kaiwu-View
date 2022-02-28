import * as THREE from "three/";
import { Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const SPEED = 0.001;

class CameraHelper {
    constructor ( scene, canvas, gui, parameters ) {
        // Inputs
        this.scene = scene;
        this.canvas = canvas;
        this.parameters = parameters
        this.gui = gui.addFolder('Camera Setting').close();
        this.camera = this.initCamera( parameters.camera );
        this.control = this.initControl( parameters.camera.lookAt );
        this.logCamera( this.parameters, this.camera, this.control )
        this.menu = null;

        this.cameraGUI();
    }

    initCamera( parameters ) {
        const camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 1000 );
        camera.position.set( parameters.position.x, parameters.position.y, parameters.position.z );
        camera.rotation.set( parameters.rotation.x, parameters.rotation.y, parameters.rotation.z )
        camera.lookAt( 0, -1.5 ,0 );
        camera.setFocalLength( parameters.focalLength );
        return camera;
    }

    getCamera(){
        return this.camera
    }

    getControl(){
        return this.control
    }

    cameraGUI() {
        let _attr = {
            'focalLength': this.camera.getFocalLength(),
            'Save': logInfo,
            'Reset': resetCamera,
        }
        let _this = this;
        this.gui.add( _attr, 'focalLength', 24, 200).onChange(function (value){
            _this.camera.setFocalLength(value);
            _this.parameters.camera.focalLength = value;
        }).name('Focal Length');
        this.gui.add( _attr, 'Save');
        this.gui.add( _attr, 'Reset');
        // this.lookAtGUI = this.cameraLookAt( this.parameters.camera.lookAt );

        function logInfo() {
            _this.cameraLog( _this.camera, _this.parameters, _this.control );
            _this.control.saveState();
        }

        function resetCamera() {
            _this.control.reset();
            _this.camera.lookAt( _this.control.target.x, _this.control.target.y, _this.control.target.z );
            // _this.lookAtGUI.destroy();
            _this.parameters.camera.lookAt.x =  _this.control.target.x;
            _this.parameters.camera.lookAt.y =  _this.control.target.y;
            _this.parameters.camera.lookAt.z =  _this.control.target.z;
            // _this.lookAtGUI = _this.cameraLookAt( _this.parameters.camera.lookAt );
            _this.control.update();
        }
    }

    cameraLog( camera, parameters, control ) {
        console.log( camera.position );
        console.log( camera.rotation );
        console.log( control.target );
        this.logCamera( parameters, camera, control )
    }

    logCamera( parameters, camera, control ) {
        parameters.camera = {
            position: {
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z,
            },
            rotation: {
                x: camera.rotation.x,
                y: camera.rotation.y,
                z: camera.rotation.z,
            },
            lookAt: {
                x: control.target.x,
                y: control.target.y,
                z: control.target.z
            },
            focalLength: camera.getFocalLength()
        };
    }

    initControl( parameters ) {
        let control = new OrbitControls( this.camera, this.canvas );
        control.target = new Vector3( parameters.x, parameters.y, parameters.z );
        control.update();
        control.saveState();
        // control.enableDamping = true;
        control.rotateSpeed = SPEED*1000;
        control.maxDistance = 100;
        control.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
        }
        return control
    }

    cameraLookAt( parameters ) {
        const _this = this;
        const lookAtGUI = this.gui.addFolder('Look At Point');
        lookAtGUI.add( parameters, 'x', -5, 5).onChange(function (value){
            _this.camera.lookAt( value, parameters.y, parameters.z );
            _this.control.target = new Vector3( value, parameters.y, parameters.z );
            _this.control.update();
        });
        lookAtGUI.add( parameters, 'y', -5, 5).onChange(function (value){
            _this.camera.lookAt( parameters.x, value, parameters.z );
            _this.control.target = new Vector3( parameters.x, value, parameters.z );
            _this.control.update();
        });
        lookAtGUI.add( parameters, 'z', -5, 5).onChange(function (value){
            _this.camera.lookAt( parameters.x, parameters.y, value );
            _this.control.target = new Vector3( parameters.x, parameters.y, value );
            _this.control.update();
        });
        return lookAtGUI;
    }

    enableToggle() {
        let setting = {
            'Enable': false,
            'initGUI': initGUI
        };
        let _this = this;

        this.gui.add( setting, 'Enable' ).onChange(function (){
            if (setting.Enable){
                _this.control.dispose();
                setting.initGUI();
            } else {
                _this.camera.position.set(
                    _this.camera.position.x,
                    _this.camera.position.y,
                    _this.camera.position.z );
                _this.menu.destroy();
                _this.control = _this.initControl();
            }
        });

        function initGUI(){
            _this.menu = cameraToggleGUI( _this.camera, _this.gui, _this.control );
        }
    }
}

function cameraToggleGUI( camera, gui, control ){
    const cameraPosition = gui.addFolder('Camera Position');
    let _attr = {
        radius: control.getDistance(),
        theta: control.getPolarAngle(),
        phi: control.getAzimuthalAngle(),
        fl: camera.getFocalLength()
    };
    cameraPosition.add( _attr, 'radius', 1, 25).onChange(function (value){
        let coordinate = spherical2Cartesian( value, _attr.theta, _attr.phi );
        camera.position.set( coordinate.x, coordinate.y, coordinate.z );
        control.update();
    });
    cameraPosition.add( _attr, 'theta', -Math.PI, Math.PI).onChange(function (value){
        let coordinate = spherical2Cartesian( _attr.radius, value, _attr.phi );
        camera.position.set( coordinate.x, coordinate.y, coordinate.z );
        control.update();
    });
    cameraPosition.add( _attr, 'phi', -Math.PI, Math.PI).onChange(function (value){
        let coordinate = spherical2Cartesian( _attr.radius, _attr.theta, value );
        camera.position.set( coordinate.x, coordinate.y, coordinate.z );
        control.update();
    });
    cameraPosition.add( _attr, 'fl', 24, 200).onChange(function (value){
        camera.setFocalLength(value);
    })


    cameraPosition.add( camera.position, 'x', -25, 25).onChange(function (value){
        camera.position.x = value;
    });
    cameraPosition.add( camera.position, 'y', -15, 15).onChange(function (value){
        camera.position.y = value;
    });
    cameraPosition.add( camera.position, 'z', -25, 25).onChange(function (value){
        camera.position.z = value;
    });
    return cameraPosition;
}

function spherical2Cartesian( radius, theta, phi ){
    let x = radius * Math.sin(theta) * Math.cos(phi);
    let y = radius * Math.sin(theta) * Math.sin(phi);
    let z = radius * Math.cos(theta);
    return { x, y, z };
}

export { CameraHelper };
