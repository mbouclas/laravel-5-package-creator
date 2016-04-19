var Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs-extra')),
    wrench = Promise.promisifyAll(require('wrench')),
    lo = require('lodash'),
    path = require('path'),
    colors = require('colors'),
    sprintF = require('sprintf').sprintf
    exec = require('child_process').exec;

/**
 * Constructor class
 * @param userInput
 * @constructor
 */
function Parser(userInput) {
    var _this = this;
    this.skeletonDir = path.resolve(__dirname,'./skeleton');
    this.userInput = userInput;
    this.userInput.className = lo.capitalize(userInput.packageName);


    /**
     * Reads skeleton folder and parses contents basesd on user input
     * @returns {*}
     */
    this.parse = function () {
        var destinationDir = path.join(path.resolve(_this.userInput.destination), userInput.vendor, userInput.packageName);
        fs.ensureDirSync(destinationDir);
        var files = wrench.readdirSyncRecursive(_this.skeletonDir);

        files.forEach(function (file) {
            var filePath = path.resolve(path.join(_this.skeletonDir,file)),
                destinationFilePath = path.resolve(path.join(destinationDir,file)),
                info = fs.lstatSync(filePath);
            
            if (info.isDirectory()){
                return;
            }
            
            if (destinationFilePath.indexOf('ServiceProvider') != -1){
                destinationFilePath = destinationFilePath.replace('ServiceProvider',_this.userInput.packageName +'ServiceProvider');
            }

            var fileContents = fs.readFileSync(filePath).toString();
            fs.outputFileSync(destinationFilePath,sprintF(fileContents,_this.userInput));
        });


        //check if we have a laravel folder
        if (typeof _this.userInput.laravelLocation != 'undefined'){
            var laravelFolder = path.resolve(_this.userInput.laravelLocation),
                composer = path.join(_this.userInput.laravelLocation,'composer.json');
            //check if composer exists
            try {
                var composerContents = require(composer);
                if (typeof composerContents.autoload == 'undefined') {
                    composerContents.autoload = {
                        "psr-4" : {}
                    }
                }

                var className = _this.userInput.vendor + '\\' + _this.userInput.packageName + '\\',
                    relativePath = path.relative(path.resolve(laravelFolder,'../')
                        ,path.resolve(path.join(_this.userInput.destination,_this.userInput.vendor)));

                composerContents.autoload['psr-4'][className] = path.join(relativePath.replace('\\','/'), _this.userInput.packageName,'/src');
                fs.outputFileSync(composer,JSON.stringify(composerContents));
                //now dump-autoload
                var cmd = 'cd ' + laravelFolder + ' && composer dump-autoload';
                return exec(cmd, function(error, stdout, stderr) {
                    if (error){
                        return Promise.reject(error);
                    }
                    console.log(stdout);
                    return Promise.resolve(files);
                });
            } catch (e){
                console.log(colors.red('composer.json not found'));
            }
        }

        return Promise.resolve(files);
    };

}

module.exports = Parser;