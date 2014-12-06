module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),

		banner: "/* <%= pkg.description %> - " +
			"Version <%= pkg.version %> - " +
			"Date: <%= grunt.template.today('dd.mm.yyyy') %> - " +
			"(c) <%= grunt.template.today('yyyy') %> <%= pkg.author %>" +
			" */",

		clean: {
			dist: {
				src: ["dist/*"]
			},
		},

		less: {
			styles: {
				options: {
					ieCompat: false,
					compress: false,
					cleancss: false,
					relativeUrls: true
				},
				files: [
					{
						"dist/bootstrap-dtpicker.css": ["src/styles/dtpicker.less", "src/styles/popover.less"],
					}
				]
			}
		},

		cssmin: {
			options: {
				keepSpecialComments: 0
			},
			styles: {
				files: {
					"dist/bootstrap-dtpicker.min.css": [
						"dist/bootstrap-dtpicker.css"
					]
				}
			}
		},

		uglify: {
			dtpicker: {
				options: {
					sourceMap: false
				},
				files: {
					"dist/bootstrap-dtpicker.min.js": ["src/bootstrap-dtpicker.js"]
				}
			}
		},

		usebanner: {
			options: {
				position: "top",
				banner: "<%= banner %>",
				linebreak: true
			},
			css: {
				src: ["dist/bootstrap-dtpicker.css", "dist/bootstrap-dtpicker.min.css"]
			},
			javascript: {
				src: ["dist/bootstrap-dtpicker.min.js"]
			}
		},

		watch: {
			styles: {
				files: ["src/**/*.less", "src/**/*.css"],
				tasks: ["less", "cssmin", "usebanner"]
			},

			scripts: {
				options: {
					spawn: false
				},
				files: ["src/**/*.js"],
				tasks: ["uglify", "usebanner"]
			}
		}

	});

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-less");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-banner");

	grunt.loadNpmTasks("grunt-contrib-watch");

	grunt.registerTask("default", ["clean", "less", "cssmin", "uglify", "usebanner"]);

};