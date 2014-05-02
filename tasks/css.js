module.exports = function (grunt) {
    var pkg = grunt.file.readJSON('package.json');
    grunt.config('uglify', {
        options: {
            mangle: true
        },
        my_target: {
            files: {
                'content/<%= pkg.services.default %>/js/lib/news_special/iframemanager__host.js': ['source/js/lib/news_special/iframemanager__host.js']
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('css', ['sass:main', 'sass:inline', 'csslint']);
};