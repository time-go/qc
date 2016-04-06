module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                src: ['src/core/head.js',
                    'src/core/ie.js',
                    'src/core/parse.js',
                    'src/core/creatvm.js',
                    'src/core/other.js',
                    'src/core/binddata.js',
                    'src/core/sweep.js',
                    'src/core/dbevent.js',
                    'src/core/extent.js',
                    'src/ajax.js',
                    'src/commonjs.js',
                    'src/component.js',
                    'src/animate.js',
                    'src/event.js'],
                dest: 'build/qc.js'
            }
        },
        uglify: {
            build: {
                src: 'build/qc.js',
                dest: 'build/qc.min.js'
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat', 'uglify']);
} 