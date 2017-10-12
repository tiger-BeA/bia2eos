const TYPE_ALL = 0,
    TYPE_PC = 1,
    TYPE_H5 = 2,
    TYPE_WECHAT = 3,
    TYPE_APP = 4;
const path = require('path');
const inquirer = require('inquirer');
const fse = require('fs-extra');
const question = require('./question');
const detail = require('./detail');

const rGetFolder = (_dir) => {
    return fse.readdirSync(_dir)
        .filter((_file) => {
            return fse.statSync(path.join(_dir, _file)).isDirectory();
        });
}

const rProDetail = (option, platform) => {
    let _detail = detail;
    _detail.name = `EOS_${option.name}.js`;
    _detail.platform = platform;
    _detail.explain = option.explain;
    _detail.onlineLink = `https://mimg.127.net/pub/common/eos/${_detail.name}`;
    return JSON.stringify(_detail, null, 4);
};

const rMkdir = (option) => {
    fse.ensureDir(option.dir)
        .then(() => {
            if (option.flag) {
                fse.ensureDir(path.join(option.dir, 'pc/')).then(() => {
                    let _name = `pc/EOS_${option.category}_P_${option.func}`;
                    fse.ensureDir(path.join(option.dir, 'pc/img'));
                    fse.outputFileSync(path.join(option.dir, `${_name}.es6`), '');
                    fse.outputFileSync(path.join(option.dir, `${_name}.scss`), '');
                    fse.copy(path.resolve(__dirname, '../index.tpl'), path.join(option.dir, 'pc/index.tpl'));
                    fse.outputFileSync(path.join(option.dir, `pc/detail.json`), rProDetail(option, TYPE_PC));
                });
                fse.ensureDir(path.join(option.dir, 'h5/')).then(() => {
                    let _name = `h5/EOS_${option.category}_M_${option.func}`;
                    fse.ensureDir(path.join(option.dir, 'h5/img'));
                    fse.outputFileSync(path.join(option.dir, `${_name}.es6`), '');
                    fse.outputFileSync(path.join(option.dir, `${_name}.scss`), '');
                    fse.copy(path.resolve(__dirname, '../index.tpl'), path.join(option.dir, 'h5/index.tpl'));
                    fse.outputFileSync(path.join(option.dir, `h5/detail.json`), rProDetail(option, TYPE_H5));
                });
            } else {
                fse.outputFileSync(path.join(option.dir, `all/EOS_${option.category}_C_${option.func}.es6`), '');
                fse.outputFileSync(path.join(option.dir, `all/EOS_${option.category}_P_${option.func}.scss`), '');
                fse.outputFileSync(path.join(option.dir, `all/EOS_${option.category}_M_${option.func}.scss`), '');
                fse.copy(path.resolve(__dirname, '../index.tpl'), path.join(option.dir, 'all/index.tpl'));
                fse.outputFileSync(path.join(option.dir, `all/detail.json`), rProDetail(option, TYPE_H5));
            }
            console.log(`init success. the component name is ${option.name}`);
            console.log(`Please complete the 【detail.json】 first.`);
        })
        .catch(err => {
            console.error('create component error.');
        })
};

inquirer.prompt(question).then((_answers) => {
    let _category = '';
    let _platform = '';
    let _func = _answers.func;
    let _dir = '';
    let _name = '';
    let _type = true;
    let _explain = _answers._explain;

    switch (_answers.category) {
        case '严选':
            _category = 'YX';
            break;
        case 'VIP':
            _category = 'VIP';
            break;
        case 'mc商城':
            _category = 'MC';
            break;
        case '严选企业购':
            _category = 'BYX';
            break;
        case '有钱':
            _category = 'YQ';
            break;
        default:
            break;
    }

    switch (_answers.platform) {
        case '普遍':
            _platform = '0';
            break;
        case '微信':
            _platform = '3';
            break;
        case '严选app':
            _platform = '4';
            break;
        default:
            break;
    }

    _name = `${_category}_C_${_func}`;
    _dir = path.resolve(__dirname, `../dev/${_name}`);

    fse.ensureDirSync(path.resolve(__dirname, `../dev`));

    // 防止与已有的冲突
    if (rGetFolder(path.resolve(__dirname, `../dev/`)).includes(_name) || rGetFolder(path.resolve(__dirname, `../../components/`)).includes(_name)) {
        console.log(`组件名冲突，请重新创建...`);
        return;
    } else {
        console.log(`组件名无冲突，创建中...`);
    }

    fse.remove(path.resolve(__dirname, `../dist`))
        .then(() => {
            let _option = {
                dir: _dir,
                flag: _answers.type == 'PC&h5分开',
                category: _category,
                func: _func,
                name: _name,
                platform: _platform,
                explain: _explain
            }
            rMkdir(_option);
        })
        .catch(err => {
            let _option = {
                dir: _dir,
                flag: (_answers.type == 'PC&h5分开'),
                category: _category,
                func: _func,
                name: _name,
                platform: _platform,
                explain: _explain
            }
            rMkdir(_option);
        })
})