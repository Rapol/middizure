const maskMiddleware = ({
    fields = [],
    maskString = '****',
} = {}) => ({
    after: async ({ context, req, result }, next) => {
        if (result) {
            fields.forEach((f) => {
                result[f] = maskString;
            });
        }
        return next({ context, req, result });
    },
});

module.exports = maskMiddleware;
