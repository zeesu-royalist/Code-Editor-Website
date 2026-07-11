import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { YSocketIO } from "y-socket.io/dist/server"
// import dotenv from "dotenv";
// dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "https://code-editor-website-z6n6.vercel.app/",
        methods: ["GET", "POST"]
    }
})
const ySocketIO = new YSocketIO(io)
ySocketIO.initialize() 

const PORT = process.env.PORT || 3000;
app.use(express.static('public'))  // serving frontend by dist[assets(css, js), html]
app.use(express.json());


// Health check route....
app.get('/health', (req, res) => {
    res.status(200).json({
        message: "Ok",
        success: true
    })
})
// 404 route......
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});
// Global err check......
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
});

httpServer.listen(PORT, () => {
    console.log(`\nServer running on http://localhost:${PORT}\n`);
});