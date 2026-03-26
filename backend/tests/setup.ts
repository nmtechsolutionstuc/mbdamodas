// Setear variables de entorno para tests ANTES de que se importe env.ts
// (dotenv/config en env.ts carga .env pero en CI no existe — usamos este setup)
process.env['DATABASE_URL'] ??= 'postgresql://test:test@localhost:5432/mbdamodas_test'
process.env['JWT_ACCESS_SECRET'] ??= 'test-access-secret-largo-para-unit-tests-no-usar-en-prod'
process.env['JWT_REFRESH_SECRET'] ??= 'test-refresh-secret-largo-para-unit-tests-no-usar-en-prod'
process.env['JWT_ACCESS_EXPIRES_IN'] ??= '15m'
process.env['JWT_REFRESH_EXPIRES_IN'] ??= '30d'
process.env['GOOGLE_CLIENT_ID'] ??= 'test-google-client-id'
process.env['GOOGLE_CLIENT_SECRET'] ??= 'test-google-client-secret'
process.env['GOOGLE_CALLBACK_URL'] ??= 'http://localhost:3000/api/v1/auth/google/callback'
process.env['NODE_ENV'] ??= 'test'
process.env['FRONTEND_URL'] ??= 'http://localhost:5173'
