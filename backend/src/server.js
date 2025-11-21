import express from 'express';
import { ENV } from './lib/env.js';
import connectDB from './lib/db.js';





const app = express();


app.use(express.json());



app.get('/', (req, res) => {
    res.send('Server api is up and running');
})


const startServer = async ()=>{
    try {
        connectDB();
        app.listen(ENV.PORT, () => console.log(`Server is running on port ${ENV.PORT}`))
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}
startServer();