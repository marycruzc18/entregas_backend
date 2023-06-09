import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import GitHubStrategy from 'passport-github2';
import bcrypt from 'bcrypt';
import UserModel from '../dao/models/user.model.js';



const initializePassport = () => {
  // Configuración de la estrategia local
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Buscar el usuario por nombre de usuario o correo electrónico
        const user = await UserModel.findOne({
          $or: [{ username }, { email: username }],
        }).exec();

        // Si no se encuentra el usuario, indicar un error de autenticación
        if (!user) {
          return done(null, false, { message: 'Usuario no encontrado' });
        }

        // Verifico la contraseña
        const passwordMatch = await bcrypt.compare(password, user.password);

        // Si la contraseña no coincide, indicar un error 
        if (!passwordMatch) {
          return done(null, false, { message: 'Contraseña incorrecta' });
        }

        // Autenticación exitosa, devolver el usuario
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.use(
    new GitHubStrategy(
      {
        clientID: 'Iv1.52f3610b86f28f0b',
        clientSecret: '96e2e14a9bfbc0b3fa84c16cb3e2f80ce0abe4f7',
        callbackURL: 'http://localhost:3000/githubcallback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await UserModel.findOne({ githubId: profile.id });

          if (!user) {
            // Si el usuario no existe en la base de datos, puedes crearlo
            user = new UserModel({
              githubId: profile.id,
              username: profile.username,
              // Otros campos de usuario según tus necesidades
            });
            await user.save();
          }

          // Autenticación exitosa, devolver el usuario
          return done(null, user);
        } catch (error) {
          // Si hay un error durante la autenticación, llamar a "done" con el error
          return done(error);
        }
      }
    )
  );




  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserModel.findById(id).exec();
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};


  
  

export default initializePassport;
