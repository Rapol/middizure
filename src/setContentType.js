const setContentType = ({
    contentType = 'application/json',
} = {}) => ({
    after: async ({ context, req, result }, next) => {
        if (context.res) {
            if (!context.res.headers) {
                context.res.headers = {};
            }
            context.res.headers['Content-type'] = contentType;
        }
        return next({ context, req, result });
    },
});

module.exports = setContentType;
