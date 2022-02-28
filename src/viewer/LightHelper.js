import * as THREE from "three/";

class LightHelper {
    constructor( scene, gui, parameters ) {
        // Inputs
        let _this = this;
        this.scene = scene;
        this.gui = gui.addFolder('Lights').close();
        this.lights = [];
        this.parameters = parameters;


        this.addEnable = true
        this.addSelection = {
            'selection': LightHelper.LIGHT.None,
            'add': addSelective,
        }

        function addSelective(){
            _this.addLight( _this.addSelection.selection );
            if ( _this.lights.length >= 3 ){
                _this.addEnable.disable();
            }
        }

        this.addMenu();
        this.loadLight( parameters );
    }


    /**
     * @summary Selections #############################################################################################
     */

    addMenu() {
        const addMenu = this.gui.addFolder('Add Light');
        addMenu.add( this.addSelection, 'selection', {
            'None': LightHelper.LIGHT.None,
            'Point': LightHelper.LIGHT.Point,
            'Directional': LightHelper.LIGHT.Directional,
            'Hemisphere': LightHelper.LIGHT.Hemisphere,
            // 'Spot': LightHelper.LIGHT.Spot,
        }).name('Light Type');
        this.addEnable = addMenu.add( this.addSelection, 'add').name('Add')
    }


    addLight( lightType, parameters ) {
        switch ( lightType ) {
            case LightHelper.LIGHT.None:
                break;
            case LightHelper.LIGHT.Point:
                this.initPointLight( parameters ? parameters : LightHelper.PointLIGHT );
                break;
            case LightHelper.LIGHT.Directional:
                this.initDirLight( parameters ? parameters : LightHelper.DirLIGHT );
                break;
            case LightHelper.LIGHT.Hemisphere:
                this.initHemiLight( parameters ? parameters : LightHelper.HemiLIGHT );
                break;
            // case LightHelper.LIGHT.Spot:
            //     this.initSpotLight();
            //     break;
        }
    }

    loadLight( parameters ){
        let _this = this;
        if ( !parameters.lights ){
            _this.parameters.lights = _this.lights;
        } else {
            for (let i = 0; i < parameters.lights.length; i++) {
                _this.addLight( parameters.lights[i].type, parameters.lights[i] );
            }
            parameters.lights = _this.lights;
        }
    }

    removeLight( light, gui ){
        this.scene.remove( light );
        light.dispose();
        gui.destroy();
    }

    removeGUI() {
        this.gui.destroy();
    }

    lightShadow( light ) {
        light.castShadow = true;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 500;
        light.shadow.radius = 4;
        light.shadow.blurSamples = 8;
        light.shadow.camera.right = 15;
        light.shadow.camera.left = - 15;
        light.shadow.camera.top	= 15;
        light.shadow.camera.bottom = - 15;
        light.shadow.mapSize.width = 512;
        light.shadow.mapSize.height = 512;
        light.shadow.bias = - 0.0005;
    }

    /**
     * @summary Lights #################################################################################################
     */
    initPointLight( lightInfo ) {
        let pointLight = new THREE.PointLight( lightInfo.color, lightInfo.intensity, lightInfo.distance );
        pointLight.position.set(3, 3, 3);
        this.lightShadow( pointLight );
        this.scene.add( pointLight );
        this.lights.push( lightInfo );
        let index = this.lights.length - 1;
        this.pointLightGUI( index, pointLight );
        return pointLight;
    }

    initDirLight( lightInfo ) {
        let dirLight = new THREE.DirectionalLight( lightInfo.color );
        let x = lightInfo.rotate.r * Math.cos( lightInfo.rotate.a * Math.PI / 180);
        let z = lightInfo.rotate.r * Math.sin( lightInfo.rotate.a * Math.PI / 180);
        dirLight.position.set( x, lightInfo.rotate.h, z);
        dirLight.intensity = lightInfo.intensity;
        this.lightShadow( dirLight );
        this.scene.add( dirLight );
        this.lights.push( lightInfo );
        let index = this.lights.length - 1;
        this.dirLightGUI( index, dirLight );
        return dirLight;
    }

    initHemiLight( lightInfo ) {
        let hemiLight = new THREE.HemisphereLight( lightInfo.color, lightInfo.groundColor );
        this.scene.add( hemiLight );
        this.lights.push( lightInfo );
        let index = this.lights.length - 1;
        this.hemiLightGUI( index, hemiLight );
        return hemiLight;
    }

    // ## TODO
    initSpotLight() {
        this.spotLightGUI();
    }

    /**
     * @summary GUI ####################################################################################################
     */
    pointLightGUI( index, pointLight ){
        let _this = this;
        let lightName = '#' + index + ' PointLight';
        const pointLightGUI = this.gui.addFolder( lightName );
        pointLightGUI.add( this.lights[index], 'intensity', 0, 100).name('Intensity').onChange(function (value){
            pointLight.intensity = value;
        });
        pointLightGUI.add( this.lights[index], 'distance', 0, 500).name('Distance').onChange(function (value){
            pointLight.distance = value;
        });
        pointLightGUI.addColor( pointLight, 'color' ).name('Color').onChange(function (){
            _this.lights[index].color = pointLight.color;
        });
        pointLightGUI.add( this.lights[index].position, 'x', -20, 20).onChange(function (value){
            pointLight.position.x = value;
        });
        pointLightGUI.add( this.lights[index].position, 'y', -20, 20).onChange(function (value){
            pointLight.position.y = value;
        });
        pointLightGUI.add( this.lights[index].position, 'z', -20, 20).onChange(function (value){
            pointLight.position.z = value;
        });
        pointLightGUI.add( this.lights[index], 'decay', 1, 5).name('Decay').onChange(function (value){
            pointLight.decay = value;
        });
        pointLightGUI.add( this.lights[index], 'power', 1, 1000).name('Power').onChange(function (value){
            pointLight.power = value;
        });
        pointLightGUI.add( this.lights[index].shadow, 'radius', 0, 10).name('Shadow Radius').onChange(function (value){
            pointLight.shadow.radius = value;
        });
        pointLightGUI.add( this.lights[index].shadow, 'blurSamples', 1, 10, 1).name('Blur Samples').onChange(function (value){
            pointLight.shadow.blurSamples = value;
        });

        let setting = {
            'Enable': true,
            'Remove': remove
        };
        pointLightGUI.add( setting, 'Enable').onChange(function (){
            if ( !setting.Enable ){
                _this.scene.remove( pointLight );
                _this.lights[index].enable = false;
            } else {
                _this.scene.add( pointLight );
                _this.lights[index].enable = true;
            }
        });
        function remove () {
            _this.addEnable.enable();
            _this.removeLight( pointLight, pointLightGUI );
            _this.lights.splice( index, 1 );
        }
        pointLightGUI.add( setting, 'Remove');
    }

    dirLightGUI( index, dirLight ){
        let _this = this;
        let lightName = '#' + index + ' Directional Light';
        const dirLightGUI = this.gui.addFolder( lightName );
        dirLightGUI.add( this.lights[index], 'intensity', 0, 20).name('Intensity').onChange(function (value){
            dirLight.intensity = value;
        });
        dirLightGUI.addColor( dirLight, 'color' ).name('Color').onChange(function (){
            _this.lights[index].color = dirLight.color;
        });
        dirLightGUI.add( this.lights[index].rotate, 'r', 0, 50).onChange(function (value){
            let x = value * Math.cos( _this.lights[index].rotate.a * Math.PI / 180);
            let z = value * Math.sin( _this.lights[index].rotate.a * Math.PI / 180);
            dirLight.position.set( x, _this.lights[index].rotate.h, z);
        }).name('Rotate Radius');
        dirLightGUI.add( this.lights[index].rotate, 'a', -360, 360).onChange(function (value){
            let x = _this.lights[index].rotate.r * Math.cos( value * Math.PI / 180);
            let z = _this.lights[index].rotate.r * Math.sin( value * Math.PI / 180);
            dirLight.position.set( x, _this.lights[index].rotate.h, z);
        }).name('Rotate Angle');
        dirLightGUI.add( this.lights[index].rotate, 'h', 1, 20).onChange(function (value){
            dirLight.position.y = value
        }).name('Light Height');
        dirLightGUI.add( this.lights[index].shadow, 'radius', 0, 10).name('Shadow Radius').onChange(function (value){
            dirLight.shadow.radius = value;
        });
        dirLightGUI.add( this.lights[index].shadow, 'blurSamples', 1, 10, 1).name('Blur Samples').onChange(function (value){
            dirLight.shadow.blurSamples = value;
        });

        let setting = {
            'Enable': true,
            'Remove': remove
        };
        dirLightGUI.add( setting, 'Enable').onChange(function (){
            if ( !setting.Enable ){
                _this.scene.remove( dirLight );
                _this.lights[index].enable = false;
            } else {
                _this.scene.add( dirLight );
                _this.lights[index].enable = true;
            }
        });
        function remove () {
            _this.addEnable.enable();
            _this.removeLight( dirLight, dirLightGUI );
            _this.lights.splice( index, 1 );
        }
        dirLightGUI.add( setting, 'Remove');
    }

    hemiLightGUI( index, hemiLight ) {
        let _this = this;
        let lightName = '#' + index + ' Hemisphere Light';
        const hemiLightGUI = this.gui.addFolder( lightName );
        hemiLightGUI.add( this.lights[index], 'intensity', 0, 20).name('Intensity').onChange(function (value){
            hemiLight.intensity = value;
        });
        hemiLightGUI.addColor( hemiLight, 'color' ).name('Sky Color').onChange(function (){
            _this.lights[index].color = hemiLight.color;
        });
        hemiLightGUI.addColor( hemiLight, 'groundColor' ).name('Ground Color').onChange(function (){
            _this.lights[index].groundColor = hemiLight.groundColor;
        });

        let setting = {
            'Enable': true,
            'Remove': remove
        };
        hemiLightGUI.add( setting, 'Enable' ).onChange(function (){
            if ( !setting.Enable ){
                _this.scene.remove( hemiLight );
                _this.lights[index].enable = false;
            } else {
                _this.scene.add( hemiLight );
                _this.lights[index].enable = true;
            }
        });
        function remove () {
            _this.addEnable.enable();
            _this.removeLight( hemiLight, hemiLightGUI );
            _this.lights.splice( index, 1 );
        }
        hemiLightGUI.add( setting, 'Remove');
    }

    spotLightGUI() {
        console.log('###TODO###')
    }
}

LightHelper.LIGHT = {
    'None': 0,
    'Point': 1,
    'Directional': 2,
    'Hemisphere': 3,
    'Spot': 4
}

LightHelper.PointLIGHT = {
    type: LightHelper.LIGHT.Point,
    intensity: 40,
    distance: 100,
    color: 0xffff00,
    position: {
        x: 3,
        y: 3,
        z: 3
    },
    decay: 1,
    power: 500,
    shadow:{
        radius: 4,
        blurSamples: 8,
    },
    enable: true
}

LightHelper.DirLIGHT = {
    type: LightHelper.LIGHT.Directional,
    intensity: 1,
    color: 0x00ffff,
    rotate: {
        r: 20,
        a: 90,
        h: 15
    },
    shadow:{
        radius: 4,
        blurSamples: 8,
    },
    enable: true
}

LightHelper.HemiLIGHT = {
    type: LightHelper.LIGHT.Hemisphere,
    intensity: 1,
    color: 0xffffff,
    groundColor: 0x121233,
    enable: true
}


export { LightHelper };
