const authenticateUser = (req, res, next) => {
    if (req.session.userValidated) {
      // El usuario está autenticado, puedes continuar con la siguiente función de middleware
      next();
    } else {
      // El usuario no está autenticado, redirige a la página de inicio de sesión
      res.redirect('/login');
    }
  };
  
  function authorize(roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      // El usuario no está autenticado, redirige a la página de inicio de sesión
      return res.redirect('/login');
    }

    const userRole = req.session.user.role;

    if (!roles.includes(userRole)) {
      // El usuario no tiene los roles adecuados, devolver un error de acceso no autorizado
      return res.status(403).json({ message: 'Acceso no autorizado' });
    }

    // El usuario tiene los roles adecuados, continuar con la siguiente función de middleware
    next();
  };
}
  
  export { authenticateUser, authorize };
  