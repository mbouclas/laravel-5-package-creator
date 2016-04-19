var Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs-extra')),
    wrench = Promise.promisifyAll(require('wrench')),
    lo = require('lodash'),
    path = require('path'),
    sprintF = require('sprintf').sprintf;

/**
 * Constructor class
 * @param userInput
 * @constructor
 */
function Parser(userInput) {
    var _this = this;
    this.skeletonDir = path.resolve('../skeleton');
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

            var fileContents = fs.readFileSync(filePath).toString();
            fs.outputFile(destinationFilePath,sprintF(fileContents,_this.userInput));
        });

        return Promise.resolve(files);
    };
    
}

module.exports = Parser;