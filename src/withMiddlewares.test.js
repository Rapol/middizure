const withMiddlewares = require('./withMiddlewares');
const logMiddleware = require('./log');
const userMiddleware = require('./checkUser');
const checkTokenMiddleware = require('./checkToken');
const maskMiddleware = require('./mask');
const databaseMiddleware = require('./database');
const tokenMiddleware = require('./checkToken');

const JWT_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGhlcmUuY29tIiwidXNlcm5hbWUiOiJhZG1pbkBoZXJlLmNvbSIsInBlcm1pc3Npb25zIjpbXSwiYXV0aG9yaXRpZXMiOlsiYWRtaW4iXSwiZ3JvdXBzIjpbXSwibG9jYWxlIjoiZW5fdXMiLCJpc3MiOiJ0ZXN0LmNvbSIsImlhdCI6MTU5MjgzMjQxNSwiZXhwIjoxNTkyODM4NDE1LCJzdWIiOiI1ZTg3Mzc1NzFjNDg0ODEzMDBhZDVlZGUifQ.JNu5Lpn_6MbCrZ2SZ6ixmk5Eq0YBj72dU2QOqHn6ZD0';
const TOKEN_RESULT = {
    bearerToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGhlcmUuY29tIiwidXNlcm5hbWUiOiJhZG1pbkBoZXJlLmNvbSIsInBlcm1pc3Npb25zIjpbXSwiYXV0aG9yaXRpZXMiOlsiYWRtaW4iXSwiZ3JvdXBzIjpbXSwibG9jYWxlIjoiZW5fdXMiLCJpc3MiOiJ0ZXN0LmNvbSIsImlhdCI6MTU5MjgzMjQxNSwiZXhwIjoxNTkyODM4NDE1LCJzdWIiOiI1ZTg3Mzc1NzFjNDg0ODEzMDBhZDVlZGUifQ.JNu5Lpn_6MbCrZ2SZ6ixmk5Eq0YBj72dU2QOqHn6ZD0',
    decodedToken: {
        email: 'admin@here.com',
        username: 'admin@here.com',
        permissions: [],
        authorities: ['admin'],
        groups: [],
        locale: 'en_us',
        iss: 'test.com',
        iat: 1592832415,
        exp: 1592838415,
        sub: '5e8737571c48481300ad5ede',
    },
    authorizationHeader:
    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGhlcmUuY29tIiwidXNlcm5hbWUiOiJhZG1pbkBoZXJlLmNvbSIsInBlcm1pc3Npb25zIjpbXSwiYXV0aG9yaXRpZXMiOlsiYWRtaW4iXSwiZ3JvdXBzIjpbXSwibG9jYWxlIjoiZW5fdXMiLCJpc3MiOiJ0ZXN0LmNvbSIsImlhdCI6MTU5MjgzMjQxNSwiZXhwIjoxNTkyODM4NDE1LCJzdWIiOiI1ZTg3Mzc1NzFjNDg0ODEzMDBhZDVlZGUifQ.JNu5Lpn_6MbCrZ2SZ6ixmk5Eq0YBj72dU2QOqHn6ZD0',
};

describe('withMiddleware', () => {
    test('one middleware', async () => {
        const testMiddleware = {
            before: jest.fn(async ({ context, req }, next) => next({ context, req })),
            after: jest.fn(async ({ context, req, result }, next) => next({ context, req, result })),
        };
        const response = {
            result: 324,
        };
        const handler = jest.fn(async () => response);
        const context = {
        };
        const req = {
            params: {
                id: '1',
            },
        };
        const app = withMiddlewares(handler, [testMiddleware]);
        const result = await app(context, req);
        expect(handler).toBeCalledTimes(1);
        expect(testMiddleware.before).toBeCalledTimes(1);
        expect(testMiddleware.after).toBeCalledTimes(1);
        expect(result).toBe(response);
    });

    test('callback handler', async () => {
        const testMiddleware = {
            before: jest.fn(async ({ context, req }, next) => next({ context, req })),
            after: jest.fn(async ({ context, req, result }, next) => next({ context, req, result })),
        };
        const response = {
            status: 200,
        };
        const handler = jest.fn((context) => {
            context.done(null, response);
        });
        const context = {
            done: jest.fn(),
        };
        const req = {
            params: {
                id: '1',
            },
        };
        const app = withMiddlewares(handler, [testMiddleware], {
            useCallback: true,
        });
        const result = await app(context, req);
        expect(handler).toBeCalledTimes(1);
        expect(testMiddleware.before).toBeCalledTimes(1);
        expect(testMiddleware.after).toBeCalledTimes(1);
        // expect(context.done).toBeCalledTimes(1);
        // expect(context.done).toBeCalledWith(null, response);
        expect(result).toBe(response);
    });
});

describe('middlewares', () => {
    describe('mask', () => {
        test('mask handler results', async () => {
            const handler = jest.fn(async () => ({
                password: 'l33t',
            }));
            const context = {
            };
            const req = {
                params: {
                    id: '1',
                },
            };
            const maskOpts = {
                fields: ['password'],
                maskString: 'cantseethis',
            };
            const app = withMiddlewares(handler, [maskMiddleware(maskOpts)]);
            const result = await app(context, req);
            expect(result.password).toBe(maskOpts.maskString);
            expect(handler).toBeCalledTimes(1);
        });
    });

    describe('token', () => {
        test('decodes jwt', async () => {
            const handler = jest.fn();
            const context = {
                log: console.log,
                res: {
                    status: 200,
                },
            };
            const req = {
                headers: {
                    Authorization: JWT_TOKEN,
                },
            };
            const app = withMiddlewares(handler, [checkTokenMiddleware()]);
            const result = await app(context, req);
            expect(handler).toBeCalledTimes(1);
            expect(handler).toHaveBeenCalledWith({
                ...context,
                middleware: {
                    checkToken: TOKEN_RESULT,
                },
            }, req);
        });
    });

    describe('database', () => {
        test('handles db connections', async () => {
            const handler = jest.fn();
            const context = {
                log: console.log,
                res: {
                    status: 200,
                },
            };
            const req = {
            };
            const connectionObject = {};
            const dbOpts = {
                databaseService: {
                    createConnection: jest.fn(async () => (connectionObject)),
                    closeConnection: jest.fn(async () => true),
                },
            };
            const app = withMiddlewares(handler, [databaseMiddleware(dbOpts)]);
            const result = await app(context, req);
            expect(handler).toBeCalledTimes(1);
            expect(handler).toHaveBeenCalledWith({
                ...context,
                middleware: {
                    database: {
                        connection: connectionObject,
                    },
                },
            }, req);
        });
    });

    describe('user', () => {
        test('adds user to middleware', async () => {
            const handler = jest.fn();
            const context = {
                log: console.log,
                res: {
                    status: 200,
                },
            };
            const req = {
                headers: {
                    Authorization: JWT_TOKEN,
                },
            };
            const connectionObject = {};
            const dbOpts = {
                databaseService: {
                    createConnection: jest.fn(async () => (connectionObject)),
                    closeConnection: jest.fn(async () => true),
                },
            };
            const UserService = jest.fn().mockImplementationOnce(() => ({
                find() {
                    return [
                        {
                            id: '123',
                            username: 'hello@world.com',
                        },
                    ];
                },
            }));
            const app = withMiddlewares(handler, [
                databaseMiddleware(dbOpts),
                tokenMiddleware(),
                userMiddleware({
                    UserService,
                }),
            ]);
            const result = await app(context, req);
            expect(handler).toBeCalledTimes(1);
            expect(handler).toHaveBeenCalledWith({
                ...context,
                middleware: {
                    database: {
                        connection: connectionObject,
                    },
                    checkToken: TOKEN_RESULT,
                    checkUser: {
                        user: {
                            id: '123',
                            username: 'hello@world.com',
                        },
                    },
                },
            }, req);
        });
    });
});
