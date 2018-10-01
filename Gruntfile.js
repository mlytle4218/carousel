module.exports = function (grunt) {

    //project configurations
    grunt.initConfig({
        uglify: {
            options: {
                banner: "/*! <%= grunt.template.today() %> */\n"
            },
            build: {
                src: ["js/Carousel.js"],
                dest: "js/carInit.min.js"
            }
        },
        watch: {
            scripts: {
                files: ["js/Carousel.js"],
                tasks: ["uglify"]
            }
        }
    });

    //load uglify plugin
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //create default task
    grunt.registerTask("default", ["uglify"]);

    //watch files
    grunt.loadNpmTasks('grunt-contrib-watch');


};