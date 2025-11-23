import express from 'express';
import { ENV } from './lib/env.js';
import connectDB from './lib/db.js';
import cors from 'cors' 
import { functions, inngest } from './lib/inngest.js';
import path from 'path';
import { serve } from "inngest/express"; 
import { fileURLToPath } from "url";
import chatRoutes from './routes/chatRoutes.js';
import {clerkMiddleware} from '@clerk/express';





const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.json());
app.use(cors({origin:ENV.CLIENT_URL,credentials:true}))
app.use(clerkMiddleware());



app.use('/api/inngest',serve({client:inngest,functions}))
app.use('/api/chat',chatRoutes);

app.get('/health', (req, res) => {
    res.send('Server api is up and running');
})





if (ENV.NODE_ENV === 'production') {
    const frontendPath = path.join(__dirname, '../../frontend/dist');

    app.use(express.static(frontendPath));

    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
}


const startServer = async ()=>{
    try {
        connectDB();
        app.listen(ENV.PORT, () => console.log(`Server is running on port ${ENV.PORT}`))
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}
startServer();