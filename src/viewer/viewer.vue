<template>
    <body>
    <div id="three-canvas"></div>
    <!--suppress HtmlUnknownTarget -->
    <img class="background" :src="state.background" alt="" />
    <div class="loading" v-if="state.loaded">
        <div class="rect1"></div>
        <div class="rect2"></div>
        <div class="rect3"></div>
        <div class="rect4"></div>
        <div class="rect5"></div>
    </div>
    <div class="button">
        <button id="autoplay" @click="autoplayDisplay">autoplay</button>
        <button id="switch" @click="switchDisplay">switch</button>
        <button id="reset" @click="resetObject">reset</button>
    </div>
    <div class="overlay" v-if="state.loaded"></div>
    </body>
</template>

<script>
// Vue
import * as THREE from 'three/';
import { onMounted, onUnmounted, reactive, watch } from "vue";

import { saveAs } from 'file-saver';
import axios from "axios";
import { ThreeHelper } from "./ThreeHelper";
import { useRoute } from "vue-router";
import { PRESET } from "./ThreeHelper";


// Global Variables
let three, params, background;

export default {
    name: "ThreeViewer",
    data() {
        return {
            bg: background
        }
    },
    setup() {
        let route = useRoute();
        params = route.query;
        console.log(params)
        const state = reactive({
            loaded: true,
            background: "/image/background.jpg"
        });

        function clearAll( parent, child ){
            if( child.children === "undefined" || child.children == null){

            }else if( child.children.length ){
                let arr    = child.children.filter( x => x );
                arr.forEach( a=> {
                    clearAll( child, a )
                })


            }
            if( child instanceof THREE.Mesh ){
                if( child.material.map ) child.material.map.dispose();
                child.material.dispose();
                child.geometry.dispose();
            }else if( child.material ){
                child.material.dispose();
            }
            child.remove();
            parent.remove( child );
        }

        function save2JSON( parameters ) {
            let data = JSON.stringify(parameters, undefined, 4);
            let bolb = new Blob([data], {type: 'text/json'});
            saveAs( bolb, "parameters.json" );
        }

        async function getJSON( url ){
            let data;
            await axios.get( url ).then(
                ( res ) =>{
                    data = res.data;
                },
                ( error ) => {
                    let status = ( error.response && error.response.status && error.response.status)
                    if ( status === 404 ){
                        data = null;
                        console.error('Url Mistake, no such file')
                    }
                }
            )
            return data
        }

        function autoplayDisplay() {
            three.autoplayDisplay();
        }

        function switchDisplay() {
            three.switchDisplay();
        }

        function resetObject() {
            three.resetObject();
        }

        onMounted(async () => {
            window.createImageBitmap = undefined; // Fix iOS Bug
            let url, type, data;
            console.log(params)
            if (params.url && params.url!=='') {
                url = params.url;
                console.log(url);
                switch (params.type) {
                    case '1':
                        data = PRESET;
                        data.modelPath = url;
                        type = 1;
                        break;
                    case '2':
                        data = await getJSON( url );
                        type = 2;
                        break;
                    case '3':
                        data = JSON.parse(params.url);
                        type = 3;
                        break;
                }
            } else  {
                data = PRESET
                type = 0
            }
            // if (params.type) {
            //     type = params.type
            //     console.log( type )
            //     if (params.type === '1') {
            //         data = PRESET
            //         data.modelPath = url
            //         type = 1
            //     } else if (params.type === '2') {
            //
            //     } else if (params.type === '3') {
            //
            //     } else {
            //         type = 0
            //     }
            // } else {
            //     type = 0
            // }
            if (data.bgPath == null) {
                state.background = "/image/background.jpg"
            } else {
                state.background = data.bgPath
            }
            console.log( type );
            // initThree( data );
            three = new ThreeHelper( data, type, state );
            window.addEventListener ( 'resize', three.onWindowResize );
            // if (isMobile ()) { gui.close (); }
        })

        onUnmounted(() => {
            console.log('UNMOUNTED')
            clearAll( three.scene, three.object );
            three.renderer.dispose();
            three.gui.destroy();
        })

        watch(
            () => state.loaded,
            () => {
                console.log('END LOADING');
            }
        )
        return {
            state,
            autoplayDisplay,
            switchDisplay,
            resetObject,
        }
    }
}
</script>

<style scoped lang="scss">
body{
    width: 100%;
    height: 100%;
}


#three-canvas{
    text-align: center;
}

.background{
    width: 100vw;
    height: 100vh;
    position: absolute;
    z-index: -1;
    left: 0;
    top: 0;
    object-fit: cover;
    user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
}

.loading{
    position: absolute;
    z-index: 1;
    left: 47vw;
    top: 40vh;
    width: 6vw;
    height: 6vh;
    text-align: center;

    div{
        background-color: #7ef6f2;
        height: 100%;
        width: 1vw;
        margin-right: 0.1vw;
        margin-left: 0.1vw;
        display: inline-block;

        -webkit-animation: stretchDelay 1.2s infinite ease-in-out;
        animation: stretchDelay 1.2s infinite ease-in-out;
    }
    .rect2 {
        -webkit-animation-delay: -1.1s;
        animation-delay: -1.1s;
    }
    .rect3 {
        -webkit-animation-delay: -1.0s;
        animation-delay: -1.0s;
    }
    .rect4 {
        -webkit-animation-delay: -0.9s;
        animation-delay: -0.9s;
    }
    .rect5 {
        -webkit-animation-delay: -0.8s;
        animation-delay: -0.8s;
    }
}

@-webkit-keyframes stretchDelay {
    0%, 40%, 100% {
        -webkit-transform: scaleY(0.4)
    }
    20% {
        -webkit-transform: scaleY(1.0)
    }
}

@keyframes stretchDelay {
    0%, 40%, 100% {
        transform: scaleY(0.4);
        -webkit-transform: scaleY(0.4);
    }
    20% {
        transform: scaleY(1.0);
        -webkit-transform: scaleY(1.0);
    }
}

.overlay{
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: #1d1d1d;
    opacity: 0.8;
}

.button{
    position: absolute;
    width: 80vw;
    left: 10vw;
    display: inline-flex;
    justify-content: space-around;
    align-content: space-around;
    bottom: 10vw;
    z-index: 5;
    button{
        margin: 10px;
        font-size: 20px;
    }
}
</style>
