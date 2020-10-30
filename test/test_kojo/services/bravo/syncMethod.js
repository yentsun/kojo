export default function (argumentA, argumentB) {

    const [ , logger ] = this;
    logger.debug('called');
    return argumentA + argumentB;
};
