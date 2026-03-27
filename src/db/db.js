import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
import express from "express";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
        console.log("Connected to MongoDB DB Host");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }   
};

export default connectDB;