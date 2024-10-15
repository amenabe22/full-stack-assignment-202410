import axios from 'axios';
import express, { Request, Response } from 'express';
import cors from 'cors';
import conversationRoutes from './controllers/conversationRoutes';

// basic express setup
const app = express();
const PORT = 5000;

app.use(express.json());
// added cors to allow Cross Site Requests from frontend app
app.use(cors());

// Route to handle AI brainstorming requests
app.use('/api/conversations', conversationRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
