import path from 'path';
import url from 'url';


async function getParentPackageInfo() {

    const filePath = path.join(process.cwd(), 'package.json');
    return import(url.pathToFileURL(filePath), { with: { type: 'json' }});
}

export { getParentPackageInfo };
