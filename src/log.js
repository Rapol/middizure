const logMiddleware = ({
    logger,
}) => ({
    before: async ({ context, req }, next) => {
        logger.init({ consoleLog: context.log, cloudEnv: process.env.CLOUD });
        logger.info('middleware::log::before', {
            headers: {
                ...req.headers,
                Authorization: Boolean(req.headers.Authorization),
                authorization: Boolean(req.headers.authorization),
            },
            query: req.query,
            params: req.params,
            body: req.body,
        });
        return next({ context, req });
    },
    after: async ({ context, req, result }, next) => {
        logger.info('middleware::log::after', result);
        return next({ context, req, result });
    },
});

module.exports = logMiddleware;
