const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const keys = require('./keys');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      const user2= {
          id: jwt_payload.id,
          name: jwt_payload.name,
          email: jwt_payload.email,
          avatar: jwt_payload.avatar
        };
        return done(null, user2);    
    })
  );
};