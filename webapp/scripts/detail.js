let detail = {
    name: "", // 组件名称
    explain: "", // 组件说明
    platform: "", // 0-全部, 1-pc, 2-h5, 3-微信, 4-严选app
    onlineLink: "",
    pc: { // pc中的依赖
        libC: [],
        libJ: []
    },
    h5: { // h5中的依赖
        libC: [],
        libJ: []
    },
    auto: [{ // 无js驱动
        className: "", // class名称
        attr: [] //其他属性说明
    }],
    detail: [ //组件详细信息
        {
            funcName: "", // 方法名称
            explain: "", // 方法解释
            param: false, // 如果为true,param的参数组合为object传入，false则按顺序传入
            params: [ // 方法参数，需说明类型
                {
                    name: "", // 参数名称
                    explain: "", // 参数解释
                    type: "", // 参数类型
                    isRequired: true // 是否必须
                }
            ],
            sonFunc: [ // 子方法
                {
                    name: "", // 方法名称，
                    explain: "", // 方法解释
                    params: [] // 方法参数，需说明类型
                }
            ]
        }
    ]
}

module.exports = detail;