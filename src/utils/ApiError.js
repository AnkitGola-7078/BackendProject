//custom error class for API errors, jo ki Error class ko extend karta hai
class ApiError extends Error {
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[],
        stack = ""
    ) {
        super(message);   // parent Error class ka constructor call
        this.statusCode = statusCode;   // HTTP status code (400, 404, 500 etc.)
        this.data = null;               // extra data agar dena ho future me
        this.message = message;         // error ka message
        this.errors = errors;           // agar multiple validation errors ho to array
        this.success = false;           // API fail hone par hamesha false

        // stack trace set karna (debugging ke liye)
          
        if (stack) {
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor);//ye batata hai error kahan se aaya hai, aur isse 
            // hum apne custom error class me stack trace ko set kar sakte hai
        }
    }
}
export { ApiError };

