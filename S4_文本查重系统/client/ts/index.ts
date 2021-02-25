declare const Vue: any;
//入口组件
const Entrance = {
    name: 'Entrance',
    template: '#entrance_tem',
    data() {
        return {};
    },
    methods:{
        fileChange(file:unknown):void{
            console.log();
        }
    }
};
//结果展示组件
const Result = {
    name: 'Result',
    template: '#result_tem',
    data() {
        return {};
    },
};

const app = new Vue({
    name: 'DuplicateCheckSystem',
    el: '#main',
    data() {
        return {
            isGetResult:false,
            msg:666
        };
    },
    components: {
        Entrance,
        Result,
    },
});

