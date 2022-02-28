import { Vector2 } from 'three/src/math/Vector2.js';
import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial.js';
import { Color } from 'three/src/math/Color.js';
import * as MathUtils from 'three/src/math/MathUtils.js';

/**
 * parameters = {
 *  clearcoat: <float>,
 *  clearcoatMap: new THREE.Texture( <Image> ),
 *  clearcoatRoughness: <float>,
 *  clearcoatRoughnessMap: new THREE.Texture( <Image> ),
 *  clearcoatNormalScale: <Vector2>,
 *  clearcoatNormalMap: new THREE.Texture( <Image> ),
 *
 *  ior: <float>,
 *  reflectivity: <float>,
 *
 *  sheen: <float>,
 *  sheenColor: <Color>,
 *  sheenColorMap: new THREE.Texture( <Image> ),
 *  sheenRoughness: <float>,
 *  sheenRoughnessMap: new THREE.Texture( <Image> ),
 *
 *  transmission: <float>,
 *  transmissionMap: new THREE.Texture( <Image> ),
 *
 *  thickness: <float>,
 *  thicknessMap: new THREE.Texture( <Image> ),
 *  attenuationDistance: <float>,
 *  attenuationColor: <Color>,
 *
 *  specularIntensity: <float>,
 *  specularIntensityMap: new THREE.Texture( <Image> ),
 *  specularColor: <Color>,
 *  specularColorMap: new THREE.Texture( <Image> )
 * }
 */

class MeshPhysicalMaterial extends MeshStandardMaterial {

	constructor( parameters ) {

		super();

		this.defines = {

			'STANDARD': '',
			'PHYSICAL': ''

		};

		this.type = 'MeshPhysicalMaterial';

		this.clearcoatMap = null;
		this.clearcoatRoughness = 0.0;
		this.clearcoatRoughnessMap = null;
		this.clearcoatNormalScale = new Vector2( 1, 1 );
		this.clearcoatNormalMap = null;

		this.ior = 1.5;

		Object.defineProperty( this, 'reflectivity', {
			get: function () {

				return ( MathUtils.clamp( 2.5 * ( this.ior - 1 ) / ( this.ior + 1 ), 0, 1 ) );

			},
			set: function ( reflectivity ) {

				this.ior = ( 1 + 0.4 * reflectivity ) / ( 1 - 0.4 * reflectivity );

			}
		} );

		this.sheenColor = new Color( 0x000000 );
		this.sheenColorMap = null;
		this.sheenRoughness = 1.0;
		this.sheenRoughnessMap = null;

		this.transmissionMap = null;

		this.thickness = 0;
		this.thicknessMap = null;
		this.attenuationDistance = 0.0;
		this.attenuationColor = new Color( 1, 1, 1 );

		this.specularIntensity = 1.0;
		this.specularIntensityMap = null;
		this.specularColor = new Color( 1, 1, 1 );
		this.specularColorMap = null;

		this._sheen = 0.0;
		this._clearcoat = 0;
		this._transmission = 0;

		this.setValues( parameters );

	}

	get sheen() {

		return this._sheen;

	}

	set sheen( value ) {

		if ( this._sheen > 0 !== value > 0 ) {

			this.version ++;

		}

		this._sheen = value;

	}

	get clearcoat() {

		return this._clearcoat;

	}

	set clearcoat( value ) {

		if ( this._clearcoat > 0 !== value > 0 ) {

			this.version ++;

		}

		this._clearcoat = value;

	}

	get transmission() {

		return this._transmission;

	}

	set transmission( value ) {

		if ( this._transmission > 0 !== value > 0 ) {

			this.version ++;

		}

		this._transmission = value;

	}

	copy( source ) {

		super.copy( source );

		this.defines = {

			'STANDARD': '',
			'PHYSICAL': ''

		};

		return this;

	}

}

MeshPhysicalMaterial.prototype.isMeshPhysicalMaterial = true;

export { MeshPhysicalMaterial };
