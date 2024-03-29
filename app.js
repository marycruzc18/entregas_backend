
import {} from 'dotenv/config'

import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerProducts from './api/swaggerProducts.js';
import swaggerCart from './api/swagger.Cart.js';
import passport from 'passport';
import initializePassport from './config/passport.config.js'
import loggerRouter from './api/routes/logger.routes.js'
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
import multer from 'multer';




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

const storage = multer.memoryStorage(); 
const upload = multer({ storage });

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


app.post('/upload', (req, res) => {
  try {
    const { fileType } = req.body; 

    let uploadFolder;

    // Determina la carpeta de destino según el tipo de archivo
    switch (fileType) {
      case 'profile':
        uploadFolder = 'profiles';
        break;
      case 'product':
        uploadFolder = 'products';
        break;
      case 'document':
        uploadFolder = 'documents';
        break;
      default:
        return res.status(400).json({ message: 'Tipo de archivo no válido' });
    }

    // Configura el destino para Multer
    upload.destination = (req, file, cb) => {
      cb(null, `./uploads/${uploadFolder}`);
    };

    // Llama al middleware de Multer para procesar la subida
    upload.array('files')(req, res, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error al subir el archivo' });
      }

      return res.status(200).json({ message: 'Archivo subido correctamente' });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al subir el archivo' });
  }
});


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
    to: '',
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

app.use('/loggerTest',loggerRouter)
app.use('/public', express.static(`${__dirname}/public`));
app.use('/', productRoutes);
app.use('/', userRoutes);
app.use('/', loginRoutes);
app.use('/chat', chatRoutes);



app.use('/swagger/products', swaggerUi.serve, swaggerUi.setup(swaggerProducts));
app.use('/swagger/cart', swaggerUi.serve, swaggerUi.setup(swaggerCart));

// Aplicar el middleware authorize
app.use(authorize(['admin']));

// Aplicar el middleware de autenticación del usuario antes de authorize
app.use(authenticateUser);
 

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
  