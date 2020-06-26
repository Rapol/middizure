const checkTokenMiddleware = require('./src/checkToken');
const databaseMiddleware = require('./src/database');
const setContentTypeMiddleware = require('./src/setContentType');
const logMiddleware = require('./src/log');
const checkUserMiddleware = require('./src/checkUser');
const withMiddlewares = require('./src/withMiddlewares');

module.exports = {
    withMiddlewares,
    databaseMiddleware,
    checkTokenMiddleware,
    checkUserMiddleware,
    logMiddleware,
    setContentTypeMiddleware,
    buildDefaultMiddlewareHandler: ({ handler, databaseService }) => withMiddlewares(handler, [
        databaseMiddleware({
            databaseService,
        }),
        checkTokenMiddleware(),
        checkUserMiddleware(),
        setContentTypeMiddleware({
            contentType: 'application/json',
        }),
    ]),
};
