var Promise = require('bluebird'),
    colors = require('colors/safe'),
    prompt = Promise.promisifyAll(require('prompt')),
    FileParser = require('./parser');

prompt.start();

var Schema = {
    properties: {
        vendor: {
            default: "IdeaSeven",
            required: true,
            description: "Vendor name"
        },
        packageName: {
            required: true,
            description: 'Package name'
        },
        destination: {
            required: true,
            description: 'Destination folder',
            default: '.'
        },
        description: {
            required: true,
            description: 'Describe your package',
            default: 'Package description'
        },
        name: {
            description: 'Your name',
            default: ''
        },
        email: {
            description: 'Your email',
            default: ''
        },
        homePage: {
            description: 'Your homepage',
            default: ''
        },
        laravelLocation : {
            description : 'Laravel installation path'
        }
    }
};

prompt.getAsync(Schema)
    .then(function (userInput) {
        var Parser = new FileParser(userInput);
        return Parser.parse();
    })
    .then(prompt.stop)
    .catch(function (err) {
/*        if (err.indexOf('canceled') != '-1'){
            return;
        }*/
        console.log(err.stack)
    });
