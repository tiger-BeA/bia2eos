const gulp = require('gulp');
const path = require('path');
const plugins = require('gulp-load-plugins'),
    $ = plugins();
const glob = require('glob');
const cssnext = require('postcss-cssnext');
const cssnano = require('cssnano');
const traverse = require('through-gulp');
const pngquant = require('imagemin-pngquant');
const os = require('os');
const mRollup = require('./config/rollup.config');
const serverConfig = require('./config/uri');
const browser = os.platform() === 'linux' ? 'google-chrome' : (
    os.platform() === 'darwin' ? 'google chrome' : (
        os.platform() === 'win32' ? 'chrome' : 'firefox'));
const rGetJsFile = (_dir) => {
    return glob.sync(_dir, { nodir: true, sync: true });
}
const jsPath = rGetJsFile(path.resolve(__dirname, './dist/**/*.js')).map((_dir) => {
    return path.relative(path.resolve(__dirname, './dist/'), _dir);
});
const cssPath = rGetJsFile(path.resolve(__dirname, './dist/**/*.css')).map((_dir) => {
    return path.relative(path.resolve(__dirname, './dist/'), _dir);
});

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
    const _task = rGetJsFile(path.resolve(__dirname, './dev/*/*.es6')).map((fileDir) => {
        let _dir = path.normalize(fileDir),
            _lastDir = _dir.split(path.sep).slice(-2, -1);
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
    return gulp.src(path.resolve(__dirname, './index.tpl'))
        .pipe($.htmlReplace({
            js: jsPath,
            css: cssPath
        }))
        .pipe($.rename({ extname: '.html' }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('moveJs', () => {
    return gulp.src(path.resolve(__dirname, `./dev/*/*.es6`))
        .pipe($.plumber({
            errorHandler: $.notify.onError("Error: <%= error %>")
        }))
        .pipe(gulp.dest(path.resolve(__dirname, `../components`)))
});

gulp.task('moveCss', () => {
    return gulp.src(path.resolve(__dirname, `./dev/*/*.scss`))
        .pipe($.plumber({
            errorHandler: $.notify.onError("Error: <%= error %>")
        }))
        .pipe(gulp.dest(path.resolve(__dirname, `../components`)))
});

gulp.task('movecomponents', () => {
    return gulp.src([path.resolve(__dirname, `./dev/!(img)**/*`), path.resolve(__dirname, `./dist/**/*`)])
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
    gulp.src('./dist/')
        .pipe($.webserver({
            port: serverConfig.port,
            host: serverConfig.host,
            livereload: true,
            directoryListing: {
                path: './dist/index.html',
                enable: true
            }
        }));
});

gulp.task('browser', () => {
    gulp.src(__filename)
        .pipe($.open({
            uri: `${serverConfig.host}:${serverConfig.port}`,
            app: browser
        }));
});

gulp.task('watch', () => {
    // 更新Js中import的css
    gulp.watch('./dev/**/*.scss', ['css', 'js']);
    gulp.watch('./dev/**/*.es6', ['js']);
    gulp.watch('./dev/**/img/*', ['img']);
    gulp.watch(['./index.tpl'], ['html']);
});

gulp.task('default', $.sequence('clean', ['img', 'css', 'js', 'watch'], 'html', ['browser', 'webserver']));

gulp.task('build', $.sequence('clean', ['img', 'css', 'js', 'moveJs', 'moveCss'], 'movecomponents'));