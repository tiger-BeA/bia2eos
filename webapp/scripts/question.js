let question = [{
        type: 'list',
        name: 'category',
        message: '请选择组件种类',
        choices: ['严选', 'VIP', 'mc商城', '严选企业购', '有钱'],
        filter: function(_val) {
            return _val;
        }
    },
    {
        type: 'list',
        name: 'type',
        message: '请选择开发类型',
        choices: ['PC&h5通用', 'PC&h5分开'],
        filter: function(_val) {
            return _val;
        }
    },
    {
        type: 'input',
        name: 'func',
        message: '请输入组件名称(字母或_)',
        validate: function(_val) {
            if (/^[a-zA-Z0-9_]+$/.test(_val)) {
                return true;
            } else {
                return '请输入正确的组件名称';
            }
        }
    },
    {
        type: 'input',
        name: 'explain',
        message: '请输入组件说明',
        filter: function(_val) {
            return _val;
        }
    }
];


module.exports = question;