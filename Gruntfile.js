module.exports = function (grunt) {

    //project configurations
    grunt.initConfig({
        uglify: {
            options: {
                banner: "/*! <%= grunt.template.today() %> */\n"
            },
            build: {
                src: ["dist/built.js"],
                dest: "dist/carInit.min.js"
            }
        },
        watch: {
            scripts: {
                files: ["js/*"],
                tasks: ["concat"]
            }
        },
        concat: {
          options: {
            separator: ';',
          },
          dist: {
            src: ['js/three.js','js/Detector.js','js/SVGLoader.js','js/Carousel.js'],
            dest: 'dist/built.js',
          },
        }
    });

    //load uglify plugin
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //create default task
    grunt.registerTask("default", ["concat","uglify"]);

    //watch files
    grunt.loadNpmTasks('grunt-contrib-watch');

    //concat files
    grunt.loadNpmTasks('grunt-contrib-concat');


};