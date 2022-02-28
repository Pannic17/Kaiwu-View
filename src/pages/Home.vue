<template>
    <body>
        <h1>开物模型参数管理后台</h1>
        <img class="logo" src="/image/logo.png" alt="" />
        <div><a href="/model_doc.pdf">具体操作步骤请点击此处下载文档</a> </div>
        <div>
            <input v-model="data.modelUrl" placeholder="模型COS地址">
            <button @click="navViewer(1)">使用模型链接</button>
        </div>
        <div>
            <input v-model="data.jsonUrl" placeholder="JSON地址">
            <button @click="navViewer(2)">使用配置文件</button>
        </div>
        <div>
            <input type="file" id="files" ref="refFile" @change="loadFile">
            <button @click="navViewer(3)" :disabled="data.disable">使用本地配置</button>
        </div>
    </body>
</template>

<script>
import { useRouter } from "vue-router";
import { reactive } from "vue";

export default {
    name: "Home",
    setup() {
        const data = reactive({
            modelUrl: '',
            jsonUrl: '',
            json: {},
            disable: true
        });
        const router = useRouter()
        const navViewer = (type) => {
            /**
             * @param type
             * 0: use default
             * 1: use model url
             * 2: use json file
             * 3: use local json file
             */
            let url
            if (type === 1){
                url = data.modelUrl
            } else if (type === 2) {
                url = data.jsonUrl
            } else if (type === 3) {
                url = data.json
            }
            router.push({
                path: '/viewer',
                query: {
                    url: url,
                    type: type
                }
            })
        }
        return {
            navViewer,
            data
        }
    },
    methods: {
        loadFile() {
            let data = this.data
            const selectedFile = this.$refs.refFile.files[0];

            var reader = new FileReader();
            reader.readAsText(selectedFile);
            reader.onload = function() {
                console.log(this.result);
                data.json = this.result
                data.disable = false
            }
        }
    }
}
</script>

<style scoped>
.logo{
    width: 100px;
    height: 100px;
}
div{
    margin: 30px;
    padding: 30px;
    font-size: 24px;
}
input{
    width: 600px;
    padding: 8px;
    font-size: 24px;
    margin-right: 36px;
}
button{
    padding: 6px;
    font-size: 24px;
}
</style>
