import * as THREE from "three/";
import {MathUtils, Vector3} from "three";
// Postprocessing
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass';
// Shader
import {FXAAShader} from "three/examples/jsm/shaders/FXAAShader.js";
// Customize Pass
import {SSRPass} from "./Postproceesing/SSRPass";
import {SSAOPass} from "./Postproceesing/SSAOPass";
import {UnrealBloomPass} from "./Postproceesing/UnrealBloomPass";
import {SSAARenderPass} from './Postproceesing/SSAAPass';
// Pass
import {SMAAPass} from "three/examples/jsm/postprocessing/SMAAPass";
import {SharpenShader} from "./Postproceesing/SharpenShader";

class PostHelper {
    constructor ( scene, composer, camera, renderer, gui, parameters ) {
        this.scene = scene;
        this.composer = composer;
        this.renderer = renderer;
        this.camera = camera;
        this.gui = gui.addFolder('Postprocessing').close();
        this.parameters = parameters.postprocessing;

        this.composer.setPixelRatio( 1 );
        this.passes = {}
        this.guigui = {}

        this.aa = this.gui.addFolder('Anti-Aliasing');
        this.initFXAA();
        this.initSMAA();
        this.composer.addPass( this.initSSAA() );
        this.composer.addPass( this.initBloom() );
        this.composer.addPass( this.initSSAO() );
        this.composer.addPass( this.initSSR() );
        this.composer.addPass( this.initSharp() );
    }


    /**
     * @summary Screen-Space ###########################################################################################
     */
    initSSR() {
        const renderer = this.renderer;
        const scene = this.scene;
        const camera = this.camera;

        const ssrPass = new SSRPass({
            renderer,
            scene,
            camera,
            width: innerWidth,
            height: innerHeight,
        })
        ssrPass.infiniteThick = false;
        ssrPass.enabled = this.parameters.enable.SSR;
        ssrPass.thickness = this.parameters.SSR.thickness;
        ssrPass.maxDistance = this.parameters.SSR.maxDistance;
        ssrPass.opacity = this.parameters.SSR.opacity;
        // noinspection JSUndefinedPropertyAssignment
        ssrPass.surfDist = this.parameters.SSR.surfDist;
        this.passes.SSR = ssrPass;
        this.ssrGUI( ssrPass );
        return ssrPass;
    }

    ssrGUI( ssrPass ) {
        const _this = this;
        const ssrGUI = this.gui.addFolder('SSR Setting').close();
        ssrGUI.add( this.parameters.enable, 'SSR').name('Enable SSR').onChange(function (){
            ssrPass.enabled = _this.parameters.enable.SSR;
        })
        ssrGUI.add( this.parameters.SSR, 'output', {
            'Default': SSRPass.OUTPUT.Default,
            'SSR Only': SSRPass.OUTPUT.SSR,
            'Depth': SSRPass.OUTPUT.Depth,
            'Normal': SSRPass.OUTPUT.Normal,
            'Metalness': SSRPass.OUTPUT.Metalness,
            'Roughness': SSRPass.OUTPUT.Roughness,
        }).onChange( function(value) {
            ssrPass.output = value;
        }).name('Output Mode');
        ssrGUI.add( this.parameters.SSR, 'thickness', 0, 5).name('Thickness').onChange(function (value){
            ssrPass.maxDistance = value;
        });
        ssrGUI.add( this.parameters.SSR, 'maxDistance', 0, 3).name('Max Distance').onChange(function (value){
            ssrPass.maxDistance = value;
        });
        ssrGUI.add( this.parameters.SSR, 'opacity', 0, 1).name('Opacity').onChange(function (value){
            ssrPass.opacity = value;
        });
        ssrGUI.add( this.parameters.SSR, 'surfDist', 0, 0.002, 0.0001).name('Surface Distance').onChange(function (value){
            ssrPass.surfDist = value;
        });
        this.guigui.SSR = ssrGUI
    }

    ssrNOGUI() {
        this.guigui.SSR.destroy();
    }

    initSSAO() {
        const ssaoPass = new SSAOPass(
            this.scene,
            this.camera,
            innerWidth,
            innerHeight
        )

        ssaoPass.renderToScreen = true;
        ssaoPass.enabled = this.parameters.enable.SSAO;
        ssaoPass.kernelRadius = this.parameters.SSAO.kernelRadius;
        ssaoPass.minDistance = this.parameters.SSAO.minDistance;
        ssaoPass.maxDistance = this.parameters.SSAO.maxDistance;
        ssaoPass.contrast = this.parameters.SSAO.contrast;

        const customKernelSize = 32;

        ssaoPass.ssaoMaterial.defines[ 'KERNEL_SIZE' ] = customKernelSize;
        ssaoPass.kernelSize = customKernelSize;

        // Override Internal Kernel
        for ( let i = 0; i < (customKernelSize-32); i ++ ) {
            const sample = new Vector3();
            sample.x = ( Math.random() * 2 ) - 1;
            sample.y = ( Math.random() * 2 ) - 1;
            sample.z = Math.random();
            sample.normalize();
            let scale = i / (customKernelSize-32);
            scale = MathUtils.lerp( 0.1, 1, scale * scale );
            sample.multiplyScalar( scale );
            ssaoPass.ssaoMaterial.uniforms[ 'kernel' ].value.concat( sample );
        }
        this.ssaoGUI( ssaoPass );
        this.passes.SSAO = ssaoPass;
        return ssaoPass;
    }

    ssaoGUI( ssaoPass ) {
        const _this = this;
        const ssaoGUI = this.gui.addFolder('SSAO Setting').close();
        ssaoGUI.add( this.parameters.enable, 'SSAO').name('Enable SSAO').onChange(function (){
            ssaoPass.enabled = _this.parameters.enable.SSAO;
        })
        ssaoGUI.add( this.parameters.SSAO, 'output', {
            'Default': SSAOPass.OUTPUT.Default,
            'SSAO Only': SSAOPass.OUTPUT.SSAO,
            'SSAO Only + Blur': SSAOPass.OUTPUT.Blur,
            'Beauty': SSAOPass.OUTPUT.Beauty,
            'Depth': SSAOPass.OUTPUT.Depth,
            'Normal': SSAOPass.OUTPUT.Normal
        }).onChange( function (value) {
            ssaoPass.output = value;
        }).name('Output Mode');
        ssaoGUI.add( this.parameters.SSAO, 'kernelRadius', 0, 5, 0.001).name('Kernel Radius').onChange(function (value){
            ssaoPass.kernelRadius = value;
        });
        ssaoGUI.add( this.parameters.SSAO, 'minDistance', 0.00001, 0.0002).name('Min Distance').onChange(function (value){
            ssaoPass.minDistance = value;
        });
        ssaoGUI.add( this.parameters.SSAO, 'maxDistance', 0.0002, 0.001).name('Max Distance').onChange(function (value){
            ssaoPass.maxDistance = value;
        });
        ssaoGUI.add( this.parameters.SSAO, 'contrast', 0, 2).name('Contrast').onChange(function (value){
            ssaoPass.contrast = value;
        });
        this.guigui.SSAO = ssaoGUI;
    }

    ssaoNOGUI(){
        this.guigui.SSAO.destroy();
    }


    /**
     * @summary Anti-Aliasing ##########################################################################################
     */
    initFXAA() {
        const fxaaPass = new ShaderPass( FXAAShader );
        fxaaPass.enabled = this.parameters.enable.FXAA;
        this.fxaaGUI( fxaaPass );
        this.passes.FXAA = fxaaPass;
        return fxaaPass;
    }

    fxaaGUI( fxaaPass ) {
        const _this = this;
        this.guigui.FXAA = this.aa.add(this.parameters.enable, 'FXAA').name('Enable FXAA').onChange(function () {
            fxaaPass.enabled = _this.parameters.enable.FXAA;
        });
        this.fxaaNOGUI();
    }

    getFXAA() {
        return this.passes.FXAA;
    }

    fxaaNOGUI() {
        this.guigui.FXAA.destroy();
    }

    initSMAA() {
        const smaaPass = new SMAAPass(
            window.innerWidth * this.renderer.getPixelRatio(),
            window.innerHeight * this.renderer.getPixelRatio()
        )
        smaaPass.enabled = this.parameters.enable.SMAA;
        this.smaaGUI( smaaPass );
        this.passes.SMAA = smaaPass ;
        return smaaPass;
    }

    smaaGUI( smaaPass ) {
        const _this = this;
        this.guigui.SMAA = this.aa.add(this.parameters.enable, 'SMAA').name('Enable SMAA').onChange(function () {
            smaaPass.enabled = _this.parameters.enable.SMAA;
        });
    }

    getSMAA() {
        return this.passes.SMAA;
    }

    smaaNOGUI() {
        this.guigui.SMAA.destroy();
    }

    initSSAA() {
        const ssaaPass = new SSAARenderPass( this.scene, this.camera );
        ssaaPass.enabled = this.parameters.enable.SSAA;
        ssaaPass.unbiased = this.parameters.SSAA.unbiased;
        ssaaPass.sampleLevel = this.parameters.SSAA.sampleLevel;
        const ssaaFormat = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType
        };
        ssaaPass.sampleRenderTarget = new THREE.WebGLRenderTarget ( window.innerWidth, window.innerHeight, ssaaFormat);
        this.ssaaGUI( ssaaPass );
        this.passes.SSAA = ssaaPass;
        return ssaaPass;
    }

    ssaaGUI( ssaaPass ) {
        const _this = this;
        this.guigui.SSAA = this.aa.add( this.parameters.enable, 'SSAA').name('Enable SSAA').onChange(function (){
            ssaaPass.enabled = _this.parameters.enable.SSAA;
        });
        const ssaaGUI = this.aa.addFolder('SSAA Setting');
        ssaaGUI.add( this.parameters.SSAA, "unbiased").onChange(function (){
            ssaaPass.unbiased = _this.parameters.SSAA.unbiased;
        }).name('Unbiased');
        ssaaGUI.add( this.parameters.SSAA, 'sampleLevel', {
            'Level 0: 1 Sample': 0,
            'Level 1: 2 Samples': 1,
            'Level 2: 4 Samples': 2,
            'Level 3: 8 Samples': 3,
            'Level 4: 16 Samples': 4,
            'Level 5: 32 Samples': 5
        }).onChange(function (){
            ssaaPass.sampleLevel = _this.parameters.SSAA.sampleLevel;
        }).name('Sample Level');
        this.guigui.SSAAx = ssaaGUI;
    }

    getSSAA() {
        return this.passes.SSAA;
    }

    ssaaNOGUI() {
        this.guigui.SSAA.destroy();
        this.guigui.SSAAx.destroy();
    }


    /**
     * @summary Beauty ################################################################################################
     */
    initBloom() {
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            this.parameters.BLOOM.strength,
            this.parameters.BLOOM.radius,
            this.parameters.BLOOM.threshold);
        bloomPass.enabled = this.parameters.enable.BLOOM;
        this.passes.BLOOM = bloomPass;
        this.bloomGUI( bloomPass );
        return bloomPass;
    }

    bloomGUI( bloomPass ) {
        const _this = this;
        const bloomGUI = this.gui.addFolder('Bloom Setting').close();
        bloomGUI.add( this.parameters.enable, 'BLOOM').name('Enable Bloom').onChange(function (){
            bloomPass.enabled = _this.parameters.enable.BLOOM;
        });
        bloomGUI.add( this.parameters.BLOOM, 'strength', 0, 3, 0.002).name('Strength').onChange(function (value){
            bloomPass.strength = value;
        });
        bloomGUI.add( this.parameters.BLOOM, 'radius', 0, 10, 0.01).name('Radius').onChange(function (value){
            bloomPass.radius = value;
        });
        bloomGUI.add( this.parameters.BLOOM, 'threshold', 0.5, 1, 0.001).name('Threshold').onChange(function (value){
            bloomPass.threshold = value;
        });
        this.guigui.BLOOM = bloomGUI;
    }

    bloomNOGUI() {
        this.guigui.BLOOM.destroy();
    }

    initSharp() {
        const sharpPass = new ShaderPass( SharpenShader );
        sharpPass.uniforms.width.value = window.innerWidth;
        sharpPass.uniforms.height.value = window.innerHeight;
        sharpPass.enabled = this.parameters.enable.SHARP;
        this.passes.SHARP = sharpPass;
        this.sharpGUI( sharpPass );
        return sharpPass;
    }

    sharpGUI( sharpPass ){
        const _this = this;
        const sharpGUI = this.gui.addFolder('Sharpen Setting').close();
        sharpGUI.add( this.parameters.enable, 'SHARP').name('Enable Sharpen').onChange( function (){
            sharpPass.enabled = _this.parameters.enable.SHARP;
        });
        sharpGUI.add( this.parameters.SHARP, 'intensity', 0, 1).name('Intensity').onChange(function (value){
            sharpPass.uniforms[ 'amount' ].value = value
        })
        this.guigui.SHARP = sharpGUI;
    }

    sharpNOGUI() {
        this.guigui.SHARP.destroy();
    }
}

export { PostHelper };
