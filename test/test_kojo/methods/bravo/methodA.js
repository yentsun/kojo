export default async function () {

    const [ , logger ] = this;
    logger.debug(`called`);
    return 'bravo';
};
