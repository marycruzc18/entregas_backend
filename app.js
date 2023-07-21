
import {} from 'dotenv/config'

import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import initializePassport from './config/passport.config.js'
import productRoutes from './api/routes/products.routes.js';
import userRoutes from './api/routes/users.router.js'
import loginRoutes from './api/routes/login.routes.js'
import chatRoutes from './api/routes/chat.routes.js'
import UserController from './api/controllers/user.controller.js';
import { __dirname } from './utils.js';
import { generateUser } from './utils.js'
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import session from 'express-session'
//import FileStore from 'session-file-store';
import MongoStore from 'connect-mongo';
import { authenticateUser, authorize }from './api/Middleware/authMiddleware.js';
import nodemailer from 'nodemailer';



const PORT = parseInt(process.env.PORT) || 3000;
const MONGOOSE_URL = process.env.MONGOOSE_URL;
const SESSION_SECRET = process.env.SESSION_SECRET;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
        credentials: false
    }
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));



//const fileStorage= FileStore(session)
//const store = new fileStorage({ path: `${__dirname}/sessions`, ttl:3600, retries: 0})}
const store = MongoStore.create({
  mongoUrl: MONGOOSE_URL,
  mongoOptions: {},
  ttl: 30
});



app.use(session({
  store:store,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized : false
}))


const transporter = nodemailer.createTransport({
  service: 'Gmail',
  port:587,
  auth: {
    user: 'USER',
    pass: 'PASS'
  }
});


app.get('/mail', (req, res) => {
  const title = req.query.title;
  const description = req.query.description;
  const mensaje = `Gracias, ${title}, tu solicitud del producto ${description} ha sido aprobada`;

  const mailOptions = {
    from: 'USER',
    to: 'ccccodigo@gmail.com',
    subject: 'Solicitud Aprobada',
    text: 'Gracias por su compra',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Correo electrónico enviado: ' + info.response);
    }
  });

  res.send('Correo electrónico enviado correctamente');
});


app.get('/mockingproducts', (req, res) => {
  const products = [];
  for (let i = 0; i < 100; i++) {
    products.push(generateUser());
  }

  res.json(products);
});

initializePassport()
app.use(passport.initialize());
app.use(passport.session());

app.use('/', productRoutes);
app.use('/', userRoutes);
app.use('/', loginRoutes);
app.use('/chat', chatRoutes);
app.use('/public', express.static(`${__dirname}/public`));

// Aplicar el middleware de autenticación del usuario antes de authorize
app.use(authenticateUser);

// Aplicar el middleware authorize
app.use(authorize(['admin']));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');


app.get('/auth/github', passport.authenticate('github'));
app.get(
  '/githubcallback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    // Redireccionar al usuario después de la autenticación exitosa
    res.redirect('/products');
  }
);

const userController = new UserController();
app.get('/current', userController.getCurrentUser.bind(userController));

io.on('connection', (socket) => {
  console.log(`Cliente conectado (${socket.id})`);
  socket.emit('server_confirm', 'Conexión recibida');
  socket.on('product_added', (product) => {
    console.log(`Producto agregado: ${JSON.stringify(product)}`);
    io.emit('product_added', product);
  });

  socket.on('chat message', (message) => {
    console.log('Mensaje recibido:', message);
    io.emit('chat message', message);
  });

  socket.on('new_product_in_cart', (product) => {;
    io.emit('product_added_to_cart', product);
});
 
});

try {
  

 await  mongoose.connect(MONGOOSE_URL) 
  server.listen(PORT, () => {
     
      console.log(`Servidor API/Socket.io iniciado en puerto ${PORT}`);
  });
} catch(err) {
  console.log('No se puede conectar con el servidor de bbdd');
}

  
export { io };
  