
export const envConfiguration = () => ({
    environment: process.env.NODE_ENV || 'dev',
    mongodb: process.env.MONGODB,
    PORT: process.env.PORT || 3002,
    defaultLimit: process.env.DEFAULT_LIMIT || 7,
})