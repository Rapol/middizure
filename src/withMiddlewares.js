const chainMiddlewares = ([firstMiddleware, ...restOfMiddlewares]) => {
    if (firstMiddleware) {
        return (args) => {
            try {
                // create the chain of middleware, passing the next chain of middleware as the next() function
                return firstMiddleware(args, chainMiddlewares(restOfMiddlewares));
            } catch (error) {
                return Promise.reject(error);
            }
        };
    }
    // recursive base case, ie last next() function which just returns the args
    return (args) => args;
};

function handlerSignatureToMiddleware(functionArgs) {
    return {
        context: {
            ...functionArgs[0],
            // initialize middleware object in context
            middleware: {},
        },
        req: functionArgs[1],
    };
}

function middlewareSignatureToHandler(functionArgs) {
    return [functionArgs.context, functionArgs.req];
}

function promisifyCallbackHandler(handler) {
    return (context, req) => new Promise((resolve, reject) => {
        context.done = (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        };
        handler(context, req);
    });
}

/**
 *
 * @param {Function} handler - function handler
 * @param {Object[]} middlewares - array of middlewares
 * @param {Object} !opts
 * @returns handler result with middleware operations applied to it if any
 */
const withMiddlewares = (handler, middlewares = [], {
    useCallback = false,
} = {}) => {
    const beforeMiddlewares = middlewares.map((m) => m.before).filter((m) => m);
    const afterMiddlewares = middlewares.map((m) => m.after).filter((m) => m).reverse();

    const chainedBeforeMiddle = chainMiddlewares(beforeMiddlewares);
    const chainedAfterMiddle = chainMiddlewares(afterMiddlewares);

    return async (...functionArgs) => {
        const middlewareArgs = handlerSignatureToMiddleware(functionArgs);
        const beforeFuncResult = await chainedBeforeMiddle(middlewareArgs);

        const handlerParameters = middlewareSignatureToHandler(beforeFuncResult);
        const promisifyHandler = useCallback ? promisifyCallbackHandler(handler) : handler;
        const result = await promisifyHandler(...handlerParameters);

        const afterFuncResult = await chainedAfterMiddle({ ...beforeFuncResult, result });

        return afterFuncResult.result;
    };
};

module.exports = withMiddlewares;
