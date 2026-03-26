import passport from 'passport'
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20'
import { env } from './env'
import { prisma } from './prisma'

passport.use(
  new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: env.googleCallbackUrl,
    },
    async (_accessToken, _refreshToken, profile: Profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        if (!email) return done(new Error('No se pudo obtener el email de Google'))

        const firstName = profile.name?.givenName ?? profile.displayName.split(' ')[0] ?? ''
        const lastName = profile.name?.familyName ?? ''
        const avatarUrl = profile.photos?.[0]?.value ?? null

        const user = await prisma.user.upsert({
          where: { googleId: profile.id },
          update: { firstName, lastName, avatarUrl },
          create: {
            googleId: profile.id,
            email,
            firstName,
            lastName,
            avatarUrl,
          },
        })

        return done(null, user as unknown as Express.User)
      } catch (err) {
        return done(err as Error)
      }
    },
  ),
)

export default passport
