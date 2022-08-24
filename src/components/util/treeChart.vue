<template> 
<div> 
    <div id="myChart" :style="{width: '1200px', height: '800px'}"></div>
</div> 
</template>
<script>
    export default {
        props: ['data'],
        watch: {
            data() {
                this.drawLine()
            }
        },
        mounted() {
            this.drawLine()
        },
        methods: {
            drawLine() {
                let data = this.data
                let myChart = this.$echarts.init(document.getElementById('myChart'))
                myChart.setOption({
                    tooltip: {
                        trigger: 'item',
                        triggerOn: 'mousemove'
                    },
                    series: [{
                        type: 'tree',

                        data: data,

                        top: '1%',
                        left: '7%',
                        bottom: '1%',
                        right: '20%',

                        symbolSize: 7,

                        label: {
                            normal: {
                                position: 'left',
                                verticalAlign: 'middle',
                                align: 'right',
                                fontSize: 12
                            }
                        },

                        leaves: {
                            label: {
                                normal: {
                                    position: 'right',
                                    verticalAlign: 'middle',
                                    align: 'left'
                                }
                            }
                        },

                        expandAndCollapse: true,
                        animationDuration: 550,
                        animationDurationUpdate: 750
                    }]
                });
            }
        }
    }
</script>
<style lang="less">
</style>
