import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


const app=express();

//  request aayegi aur credentials true karne se cookies bhi bhej sakte hai
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true, limit:"16kb"}));
app.use(cookieParser());
app.use(express.static("public"));

//import routes
import userRoutes from './routes/user.routes.js';

//use routes
app.use("/api/v1/users", userRoutes);//localhost:5000/api/v1/users

export  default app;

