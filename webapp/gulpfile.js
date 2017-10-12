const mRollup = require('./config/rollup.config');
const serverConfig = require('./config/uri');

const gulp = require('gulp');
const path = require('path');
const plugins = require('gulp-load-plugins'),
    $ = plugins();
const glob = require('glob');
const cssnext = require('postcss-cssnext');
const cssnano = require('cssnano');
const pngquant = require('imagemin-pngquant');
const os = require('os');
const through = require('through2');
const browser = os.platform() === 'linux' ? 'google-chrome' : (
    os.platform() === 'darwin' ? 'google chrome' : (
        os.platform() === 'win32' ? 'chrome' : 'firefox'));

const rGetFile = (_dir) => {
    return glob(_dir, { nodir: true, sync: true });
}
const rGetDir = (_dir) => {
    return glob(_dir, { sync: true });
}

const rHtmlPath = rGetDir(path.resolve(__dirname, './dist/*/*/')).map((_dir) => {
    return _dir;
});
const serverPort = (() => {
    let serverPort = [],
        _port = serverConfig.port;
    for (let idx in rHtmlPath) {
        serverPort.push(_port++);
    }
    return serverPort;
})();

gulp.task('img', () => {
    return gulp.src(path.resolve(__dirname, './dev/**/img/*.*(png|jpg|gif|ico)'))
        .pipe($.plumber({
            errorHandler: $.notify.onError("Error: <%= error %>")
        }))
        .pipe($.cache($.imagemin({
            optimizationLevel: 5, // 0-7, 优化等级
            progressive: true, // 无损压缩jpg
            interlaced: true, // 隔行gif进行扫描
            use: [pngquant()] // 深度压缩png
        })))
        .pipe(gulp.dest(path.resolve(__dirname, `./dist/`)))
});

gulp.task('css', () => {
    return gulp.src(path.resolve(__dirname, `./dev/**/*.scss`))
        .pipe($.plumber({
            errorHandler: $.notify.onError("Error: <%= error %>")
        }))
        .pipe($.cached('cssing'))
        .pipe($.sass().on('error', $.sass.logError))
        .pipe($.postcss([
            cssnext({
                browsers: [
                    'last 2 versions',
                    '> 1%',
                    'ie >= 8',
                    'iOS >= 8',
                    'Android >= 4'
                ],
                // Avoid warnning of autoprefix twice with cssnano
                warnForDuplicates: false
            }),
            cssnano({
                // Avoid cssnano's optimization
                safe: true
            })
        ]))
        .pipe($.cssBase64({
            baseDir: '',
            maxWeightResource: 6144,
            extensionsAllowed: ['.gif', '.jpg', '.png']
        }))
        .pipe(gulp.dest(path.resolve(__dirname, `./dist/`)))
});

gulp.task('js', () => {
    const _task = rGetFile(path.resolve(__dirname, './dev/**/*.es6')).map((fileDir) => {
        let _dir = path.normalize(fileDir),
            _lastDir = _dir.split(path.sep).slice(-3, -1).join('/')
        return gulp.src(_dir)
            .pipe($.plumber({
                errorHandler: $.notify.onError("Error-img: <%= error %>")
            }))
            .pipe($.cached(`jsing`))
            .pipe($.rollup(mRollup(_dir, 'build')))
            .pipe($.rename({ extname: `.js` }))
            .pipe(gulp.dest(path.resolve(__dirname, `./dist/${_lastDir}/`)));
    });
    return _task;
});

gulp.task('html', () => {
    return gulp.src(path.resolve(__dirname, './dev/**/index.tpl'))
        .pipe(through.obj((file, env, cb) => {
            console.log(rGetFile(path.resolve(path.dirname(file.path), './*.js')))
            $.htmlReplace({
                js: rGetFile(path.resolve(path.dirname(file.path), './*.js')),
                css: file.path
            })
            cb();
        }))
        .pipe($.rename({ extname: '.html' }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('moveJs', () => {
    return gulp.src(path.resolve(__dirname, `./dev/**/*.es6`))
        .pipe($.plumber({
            errorHandler: $.notify.onError("Error: <%= error %>")
        }))
        .pipe(gulp.dest(path.resolve(__dirname, `../components`)))
});

gulp.task('moveCss', () => {
    return gulp.src(path.resolve(__dirname, `./dev/**/*.scss`))
        .pipe($.plumber({
            errorHandler: $.notify.onError("Error: <%= error %>")
        }))
        .pipe(gulp.dest(path.resolve(__dirname, `../components`)))
});

gulp.task('movecomponents', () => {
    return gulp.src([path.resolve(__dirname, `./dev/**!(img)/*`), path.resolve(__dirname, `./dist/**/**`)])
        .pipe($.plumber({
            errorHandler: $.notify.onError("Error: <%= error %>")
        }))
        .pipe(gulp.dest(path.resolve(__dirname, `../components`)))
});

gulp.task('clean', () => {
    return gulp.src(path.resolve(__dirname, `./dist/*`))
        .pipe($.clean({ force: true }))
});

gulp.task('webserver', () => {
    rHtmlPath.forEach((v, idx) => {
        console.log(v)
        return gulp.src(`${v}/*`)
            .pipe($.webserver({
                post: serverPort[idx],
                host: serverConfig.host,
                livereload: true,
                directoryListing: {
                    path: './index.html',
                    enable: true
                }
            }));
    })
});

gulp.task('browser', () => {
    serverPort.forEach((v, idx) => {
        return gulp.src(__filename)
            .pipe($.open({
                uri: `${serverConfig.host}:${v}`,
                app: browser
            }));
    });
});

gulp.task('watch', () => {
    // 更新Js中import的css
    gulp.watch('./dev/**/*.scss', ['css', 'js']);
    gulp.watch('./dev/**/*.es6', ['js']);
    gulp.watch('./dev/**/img/*', ['img']);
    gulp.watch('./dev/**/index.tpl', ['html']);
});

gulp.task('default', $.sequence('clean', ['img', 'css', 'js', 'watch'], 'html', ['browser', 'webserver']));

gulp.task('build', $.sequence('clean', ['img', 'css', 'js', 'moveJs', 'moveCss'], 'movecomponents'));