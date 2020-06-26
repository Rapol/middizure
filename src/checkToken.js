const jwtDecode = require('jwt-decode');

const tokenMiddleware = () => ({
    before: async ({ context, req }, next) => {
        const authorizationHeader = req.headers.Authorization || req.headers.authorization;
        if (!authorizationHeader) {
            throw new Error({
                code: 'TokenNotFoundException',
                message: 'Token was not found in header.',
                status: 401,
            });
        }
        const bearerToken = authorizationHeader ? authorizationHeader.split(' ')[1] : null;
        if (!bearerToken) {
            throw new Error({
                code: 'TokenNotFoundException',
                message: 'Token was not found in header.',
                status: 401,
            });
        }
        try {
            const decodedToken = jwtDecode(bearerToken);
            context.middleware.checkToken = {
                bearerToken,
                decodedToken,
                authorizationHeader,
            };
        } catch (e) {
            throw new Error({
                message: 'Could not verify the token given.',
                status: 401,
                code: 'TokenNotVerifiedException',
            });
        }
        return next({ context, req });
    },
});

module.exports = tokenMiddleware;
