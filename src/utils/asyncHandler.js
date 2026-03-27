//- Centralized Error Handling(means har route pe try  catch likhne ki jarurta nhi hai)
const asyncHandler =(requestHandler) => async (req,res,next)=>{
    return Promise.resolve(requestHandler(req,res,next))
    .catch((err)=>{next(err)});
        
    

     //Agar requestHandler me koi error throw hota hai (jaise DB query fail ho jaye), to 
    // .catch(next) us error ko Express ke error-handling middleware tak forward kar deta hai.

}

export {asyncHandler};

// const asyncHanler=(fn)=> async (req,res,next)=>{
//     try{
//         await fn(req,res,next);
//     }catch(e){

         // Agar error aaya to yahin response bhej diya
//         res.status(e.code || 500).json({
//             success:false,
//             message:e.message || "Internal Server Error"
//         })
//     }
    
// }