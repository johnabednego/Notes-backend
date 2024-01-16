import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import noteRoutes from './routes/note-routes.mjs';
import { httpError } from './utils.mjs';
import { emptyTrash, getArchivedNotes } from './controllers/note-controllers.mjs';

// Hardcoded configuration values
const appPort = process.env.PORT || 4000; 
const corsAllowOrigins = ['http://localhost:5173', 'https://notes-virid-five-54.vercel.app']; 
const payloadLimit = '1mb'; 

// MongoDB Atlas connection string
//For security reasons, I am setting the dbUrl as a github secret variable
// const dbUrl = 'mongodb+srv://<username>:<password>@cluster0.yn9ml.mongodb.net/NotesDB?retryWrites=true&w=majority'; 
const dbUrl = process.env.MONGODB_URL;

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests', errorCode: 'too_many_requests' },
});

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

// API routes
app.use('/api/v1/notes', noteRoutes);
app.get('/api/v1/health-check', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Define a route that handles emptying the trash
app.post('/api/v1/empty-trash', async (req, res, next) => {
  try {
    // Call the emptyTrash controller function
    await emptyTrash(req, res, next);
   
  } catch (err) {
    // Handle any errors and pass them to the error handling middleware
    next(err);
  }
});

// Define a route that handles 
app.get('/api/v1/archived', async (req, res, next) => {
  try {
    // Call the emptyTrash controller function
    await getArchivedNotes(req, res, next);
   
  } catch (err) {
    // Handle any errors and pass them to the error handling middleware
    next(err);
  }
});

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

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(appPort, () => {
      console.log(`Server running on port ${appPort}`);
    });
  })
  .catch(err => {
    console.error(`Database connection failed. Exiting now...\n${err}`);
    process.exit(1);
  });
