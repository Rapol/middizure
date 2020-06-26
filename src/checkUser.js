const userMiddleware = ({
    UserService,
} = {}) => ({
    before: async ({ context, req }, next) => {
        if (!context.middleware.database || !context.middleware.checkToken) {
            throw new Error('Database and token middleware are required');
        }
        const { decodedToken } = context.middleware.checkToken;
        const [user] = await new UserService().find({ user_id: `${decodedToken.user_id}` });
        context.middleware.checkUser = {
            user,
        };
        return next({ context, req });
    },
});

module.exports = userMiddleware;
