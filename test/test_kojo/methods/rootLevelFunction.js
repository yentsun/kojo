export default async function () {
    const [ kojo, logger ] = this;
    logger.debug('Root-level service function called');
    return 'root-level-result';
}
