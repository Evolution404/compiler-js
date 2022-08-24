import Vue from 'vue'
import vuex from 'vuex'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App.vue'
import home from './components/home.vue'
import lex from './components/lex.vue'
import parsing from './components/parsing.vue'
import semantic from './components/semantic.vue'
import VueResorce from 'vue-resource'
import Echarts from 'echarts'

Vue.use(VueRouter)
Vue.use(ElementUI)
Vue.use(VueResorce)
Vue.use(vuex)
Vue.prototype.$echarts = Echarts
var store = new vuex.Store({
    state: {
        step: 0,
        text: `int main(){
    int a = 1;
    int b = 2;
    if(a==1){
        a = 2;
    }
    while(a==2){
        a = 3;
    }
    for(a=3;a<10;a++){
        b=b+2;
    }
    return 0;
}
int hello(void good(int a), int b){
    good(b)
}`,
        lex: [],
        par: "",
        sem: [],
    },
    mutations: {
        change(state, newVal) {
            // 变更状态
            state.text = newVal
        },
        changeLex(state, newVal) {
            state.lex = newVal
        },
        setStep(state, newVal) {
            state.step = newVal
        },
        setPar(state, newVal) {
            state.par = newVal
        },
        reset(state) {
            state.lex = []
            state.sem = []
        }
    }
})

var router = new VueRouter({
    routes: [{
            path: '/',
            redirect: '/home',
        },
        {
            path: '/home',
            component: home,
        },
        {
            path: '/lex',
            component: lex,
        },
        {
            path: '/parsing',
            component: parsing,
        },
        {
            path: '/semantic',
            component: semantic,
        }
    ],
})

var app = new Vue({
    el: '#app',
    router,
    store,
    render: c => c(App),
})
