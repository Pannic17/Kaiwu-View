/**
 * Full-screen textured quad shader
 */

var SSAAShader = {

	uniforms: {

		'dfs': { value: null },
		'opc': { value: 1.0 }

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform float opc;

		uniform sampler2D dfs;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( dfs, vUv );
			gl_FragColor = opc * texel;

		}`

};

export { SSAAShader };
