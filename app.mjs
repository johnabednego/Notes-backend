import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';

// Hardcoded configuration values
const appPort = 3000; 
const corsAllowOrigins = ['http://localhost:3000', 'http://localhost:5173']; 
const payloadLimit = '1mb'; 


const corsOptions = {
  origin: corsAllowOrigins,
  credentials: true,
};

const app = express();

app.use(cors(corsOptions));
app.use(limiter);
app.use(helmet());
app.use(mongoSanitize());
app.use(express.json({ limit: payloadLimit }));



// Undefined routes handler
app.use('/', (req, res, next) => {
  return next(httpError(404, 'not_found', 'API resource is not found'));
});

// Error handling
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message || 'Something went wrong',
    errorCode: err.errorCode || 'internal_error',
  });
});

