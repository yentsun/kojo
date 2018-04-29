const path = require('path');


module.exports = {

    getParentPackageInfo() {

        const filePath = path.join(process.cwd(), 'package.json');
        try {
            return require(filePath);
        } catch (error) {
            return {}
        }

    }

};
