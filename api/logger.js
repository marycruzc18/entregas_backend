import winston from "winston";
import fs from 'fs';


const logLevel = {
    fatal:0,
    error:1,
    warning:2,
    info:3,
    http:4,
    debug:5
};

const logColor ={
    fatal:'red',
    error:'red',
    warning:'yellow',
    info:'green',
    http:'blue',
    debug:'cyan'
};

winston.addColors(logColor);

const developmentConfig = winston.createLogger({
    levels: logLevel,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console(),
     
    ],
  });
  
 // Configuración para el entorno de producción
const productionConfig = {
  levels: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'errors.log', level: 'error' }),
  ],
};

// Seleccionar la configuración según el entorno
const loggerConfig = process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig;

const logger = winston.createLogger(loggerConfig);

export default logger;
  
  
  
  
  
  
  
  

