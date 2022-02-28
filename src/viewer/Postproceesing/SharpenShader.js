var SharpenShader = {
    uniforms: {
        "tDiffuse": { value: null },
        "width": { value: 0.0 },
        "height": { value: 0.0 },
        "kernel": { value: [-1, -1, -1, -1, 8, -1, -1, -1, -1]},
        "amount": { value: 0.1 }
    },
    vertexShader: /* glsl */`
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}
	`,
    fragmentShader: /* glsl */`
        #include <common>
        uniform sampler2D tDiffuse;
        varying vec2 vUv;
        uniform float width;
        uniform float height;
        uniform float kernel[9];
        uniform float amount;

        void main(){
            float step_w = 1.0/width;
            float step_h = 1.0/height;
            vec2 offset[9];
            float alpha = 0.0;
            offset[0] = vec2(-step_w, -step_h);
            offset[1] = vec2(0.0, -step_h);
            offset[2] = vec2(step_w, -step_h);
            offset[3] = vec2(-step_w, 0.0);
            offset[4] = vec2(0.0, 0.0);
            offset[5] = vec2(step_w, 0.0);
            offset[6] = vec2(-step_w, step_h);
            offset[7] = vec2(0.0, step_h);
            offset[8] = vec2(step_w, step_h);
            vec3 sum = vec3(0.0);
            for ( int i = 0; i < 9; i++) {
                sum += texture2D( tDiffuse, vUv + offset[i]).rgb * kernel[i] * amount;
                // alpha += texture2D( tDiffuse, vUv + offset[i]).a;
            }
            sum += texture2D( tDiffuse, vUv).rgb * 1.0;
            alpha = texture2D(tDiffuse, vUv).a;
            gl_FragColor = vec4(sum, alpha);
        }
    `
}

export { SharpenShader };
