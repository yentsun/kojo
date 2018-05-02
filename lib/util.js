const path = require('path');


module.exports = {

    getParentPackageInfo() {

        const filePath = path.join(process.cwd(), 'package.json');
        return require(filePath);
    }

};
