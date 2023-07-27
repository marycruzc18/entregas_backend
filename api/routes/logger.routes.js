import express from 'express';
import logger from '../../api/logger.js'


const router = express.Router();

// Ruta especial para pruebas sin autenticación
router.get('/loggerTest', (req, res) => {
    res.render('test'); 
  });
  

// Ruta para probar el log de nivel debug
router.get('/loggerTest/debug', (req, res) => {
    logger.debug('Esto es un mensaje de nivel debug');
    res.send('Log de nivel debug realizado');
  });
  
  // Ruta para probar el log de nivel info
  router.get('/loggerTest/info', (req, res) => {
    logger.info('Esto es un mensaje de nivel info');
    res.send('Log de nivel info realizado');
  });
  
  // Ruta para probar el log de nivel warning
  router.get('/loggerTest/warning', (req, res) => {
    logger.warning('Esto es un mensaje de nivel warning');
    res.send('Log de nivel warning realizado');
  });
  
  // Ruta para probar el log de nivel error
  router.get('/loggerTest/error', (req, res) => {
    logger.error('Esto es un mensaje de nivel error');
    res.send('Log de nivel error realizado');
  });
  
  // Ruta para probar el log de nivel fatal
  router.get('/loggerTest/fatal', (req, res) => {
    logger.fatal('Esto es un mensaje de nivel fatal');
    res.send('Log de nivel fatal realizado');
  });
  
 export default router;