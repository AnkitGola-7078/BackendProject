import app from "./app.js";
import connectDB from "./db/db.js";
import dotenv from "dotenv";

dotenv.config({});

connectDB().then(()=>{
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with an error code
});  



 












/*(async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);  
        console.log("Connected to MongoDB");
        
        app.on("error", (error) => {
            console.error("Error starting the server:", error);
            throw error;
        });

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
})();*/