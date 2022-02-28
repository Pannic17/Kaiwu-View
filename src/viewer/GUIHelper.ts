// noinspection TypeScriptValidateJSTypes
import * as THREE from 'three/';

export function settingGUI( gui: any, parameters: any, renderer: any, ambient: any ) {
    const settingGUI = gui.addFolder('Settings');
    // settingGUI.add( parameters, 'intensity', 0, 1, 0.01).name('Light Intensity');
    ambientGUI( settingGUI, parameters, ambient );
    settingGUI.add( parameters, 'hdrExposure', 0, 2, 0.01).name('HDR Exposure');
    settingGUI.add( parameters, 'enablePostprocessing').name('Postprocssing');
    toneMappingGUI( settingGUI, parameters, renderer );
}

function ambientGUI( gui: any, parameters: any, ambient: any) {
    gui.add( parameters, 'ambientIntensity', 0, 5, 0.01).name('Ambient Intensity').onChange(function (){
        ambient.intensity = parameters.ambientIntensity;
    });
}

export const toneMappingOptions = {
    None: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping
};

function toneMappingGUI( gui: any, parameters: any, renderer: any ) {
    // noinspection TypeScriptValidateJSTypes
    gui.add( parameters, 'toneMapping',
        Object.keys(toneMappingOptions)
    ).onChange( function () {
        // @ts-ignore
        renderer.toneMapping = toneMappingOptions[ parameters.toneMapping ];
    }).name('Tone Mapping');
}