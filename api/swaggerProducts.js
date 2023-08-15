import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options = {
    definition:{
        openapi:'3.0.0',
        info: {
            title:'API de Módulo de Productos',
            version: '1.0.0',
            description: 'Documentación de la API de Módulo de Productos',
        },
    },

    apis:['./api/routes/products.routes.js'],
};

const specs = swaggerJSDoc(options);

export default (app) => {
    app.use('/api-docs/products', swaggerUi.serve, swaggerUi.setup(specs))
}