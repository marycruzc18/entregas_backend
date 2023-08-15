import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Módulo de Carrito',
      version: '1.0.0',
      description: 'Documentación de la API de Módulo de Carrito',
    },
  },
  apis: ['./api/routes/cart.routes.js'], 
};

const specs = swaggerJSDoc(options);

export default (app) => {
  app.use('/api-docs/cart', swaggerUi.serve, swaggerUi.setup(specs));
};
