const isGraphqlPlayground = (req) => req && req.headers && (req.headers['x-Apollo-Tracing'] !== undefined || req.headers['x-apollo-tracing'] !== undefined);

const databaseMiddleware = ({
    databaseService,
} = {}) => {
    if (!databaseService) {
        throw new Error('dabaseService not supplied in middleware');
    }
    return {
        before: async ({ context, req }, next) => {
            if (!isGraphqlPlayground(req)) {
                const connection = await databaseService.createConnection();
                context.middleware.database = {
                    connection,
                };
            }
            return next({ context, req });
        },
        after: async ({ context, req, result }, next) => {
            if (!isGraphqlPlayground(req)) {
                await databaseService.closeConnection();
            }
            return next({ context, req, result });
        },
    };
};

module.exports = databaseMiddleware;
