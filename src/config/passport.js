const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');

module.exports = (passport, prisma) => {
    const opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
    };

    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
            try {
                const user = await prisma.user.findUnique({ where: { id: jwt_payload.id } });
                if (user) {
                    return done(null, user);
                }
                return done(null, false);
            } catch (error) {
                console.error(error);
                return done(error, false);
            }
        })
    );
};