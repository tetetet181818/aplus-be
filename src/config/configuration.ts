export default () => ({
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
    frontendUrl:
      process.env.NODE_ENV === 'development'
        ? process.env.FRONTEND_SERVER_DEVELOPMENT
        : process.env.FRONTEND_SERVER_PRODUCTION,
  },
  database: {
    url:
      process.env.NODE_ENV === 'development'
        ? process.env.DEVELOPMENT_DATABASE_URL
        : process.env.PRODUCTION_DATABASE_URL,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  aws: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    buckets: {
      avatars: process.env.AWS_BUCKET_AVATARS,
      thumbnails: process.env.AWS_BUCKET_THUMBNAILS,
      courses: process.env.AWS_BUCKET_COURSES,
      notes: process.env.AWS_BUCKET_NOTES_FILES,
    },
  },
  mail: {
    smtpPassword: process.env.SMTP_PASSWORD,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },
});
