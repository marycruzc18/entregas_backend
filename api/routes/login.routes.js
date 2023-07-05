import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
   
    res.render('products');
  } else {
    
    res.render('login');
  }
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/products',
  failureRedirect: '/login',
}));

router.get('/logout', (req, res) => {
  req.logout(function (err) {
    if (err) {
     
      console.error(err);
      return res.status(500).send('Error interno del servidor');
    }
   
    res.redirect('/');
  });
});


router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/auth/github', passport.authenticate('github'));

router.get(
  '/githubcallback',
  passport.authenticate('github', {
    successRedirect: '/products',
    failureRedirect: '/login',
  })
);


export default router;
