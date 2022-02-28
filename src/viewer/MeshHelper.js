import * as THREE from "three";
import { MeshPhysicalMaterial } from "./MeshPhysicalMaterial";

class MeshHelper {
    constructor( mesh, gui, parameters, index ) {
        this.geometry = mesh.geometry;
        this.material = mesh.material
        this.parameters = parameters;
        let materialName = mesh.name;
        this.gui = gui.addFolder( materialName ).close();
        // this.sheenGUI();
    }



    /**
     * @summary For Physical Mesh ######################################################################################
     */
    sheenGUI() {
        this.gui.add( this.material, 'sheen', 0, 1)
    }

    updateMesh() {
        return new THREE.Mesh( this.geometry, this.material );
    }
}

export { MeshHelper }
