import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {uploadCloudinary} from '../utils/cloudinary.js'
import {User} from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken=async(userId)=>{
  try{
      const user=await User.findById(userId);
      
      //generate access token and refresh token
      const accessToken=await user.generateAccessToken();
      const refreshToken=await user.generateRefreshToken();
      user.refreshToken=refreshToken;

      await user.save({validateBeforeSave:false});//save refresh token to database
      return {accessToken, refreshToken};
      
  }catch(e){
    throw new ApiError(500, "Error generating tokens");
  }
}



// @desc    Register a new user
const registerUser = asyncHandler(async (req, res) => {
  //get user data from request body
  const {fullname,email,username,password,coverImage}=req.body
  console.log(email);
  
  // Validation: Check if all required fields are provided and not empty    
    if ([fullname, email, username, password].some(field => field?.trim() === "")) {
       throw new ApiError(400, "All fields are required");
    }

   //check if user already exists: email,username
   const userExists = await User.findOne({
     $or: [{ username }, { email }]
   });
   if (userExists) {
     throw new ApiError(409, "User with email or username already exists");
   }


   //check if avatar and coverImage files are uploaded
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar and Cover Image are required");
    }
     

    //ise cover image is uploaded or not boz cover image is optional
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    

    //upload avatar and cover image to cloudinary
    const avatarUrl = await uploadCloudinary(avatarLocalPath, "avatars");
    const coverImageUrl = await uploadCloudinary(coverImageLocalPath, "coverImages");


    if(!avatarUrl || !coverImageUrl){
        throw new ApiError(500, "Error uploading images");
    }

    //create user object and save to database
    const user = await User.create({
        fullname,
        avatar:avatarUrl.url,
        coverImage:coverImageUrl?.url||"",
        email,
        password,
        username:username.toLowerCase()
     })
     

     //remove password and refreshToken from response
     //fetch the created user from database to get all fields except password and refreshToken
     const createdUser=await User.findById(user._id).select("-password -refreshToken")
     

     //check if user is created successfully
     if(!createdUser){
        throw new ApiError(500, "Error creating user");
     }
    
     //return success response with created user data
     res.status(201).json(new ApiResponse(201, "User registered successfully", createdUser));
     
});

//login user 
const loginUser =asyncHandler(async (req,res)=>{
    //get email and password from (request body)
    const {email,password,username}=req.body;

    //validation: check if email and password are provided and not empty
    if(!email && !username){
        throw new ApiError(400, "Email and password are required");
    }

    //find user by email or username
    const user=await User.findOne({
      $or :[{email},{username}]
    })
    if(!user){
        throw new ApiError(404, "User not found");
    }

    //check if password is correct
    const isPasswordCorrect=await user.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid password");
    }
    
    //generate access token and refresh token
    const tokens=await generateAccessAndRefreshToken(user._id);

    //remove password and refreshToken from response boz abhi hamne user ko login karwaya hai to usko password aur refresh token ki jarurat nhi hai response me
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken");
    
    //ise response me access token aur refresh token bhi bhej do
    const options={
        httpOnly:true,
        secure:true
    } 
  
    //return response
    return res.status(200)
              .cookie("accessToken", tokens.accessToken, options)
              .cookie("refreshToken", tokens.refreshToken, options)
              .json(
                new ApiResponse(
                      200,
                      {
                        user:loggedInUser,
                        accessToken:tokens.accessToken,
                        refreshToken:tokens.refreshToken
                      },
                       "User logged In Successfully"
                  )
              )
    
})

//logout route
const logoutUser = asyncHandler(async (req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

   const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(200,{},"User logged Out")
    )
})

//refresh token
const refreshAcessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken =req.cookies.refreshToken || req.body.refreshToken
     
    if(incomingRefreshToken){
      throw new ApiError(401,"unauthorized request");
    }

   try {
     const decodedToken = jwt.verify(
       incomingRefreshToken,
       process.env.REFRESH_TOKEN_SECRET
     )
 
     const user=await User.findById(decodedToken?._id);
     if(!user){
       throw new ApiError(401,"Invalid refrsh token")
     }
 
     if(incomingRefreshToken !== user?.refreshToken){
       throw new ApiError(401,"Refresh token is expired or used")
     }
 
     const options={
       httpOnly:true,
       secure:true,
     }
 
     const {accessToken,NrefreshToken}=await generateAccessAndRefreshToken(user._id);
 
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",NrefreshToken,options)
     .json(
       new ApiResponse(
         200,
         {accessToken,refreshToken:NrefreshToken},"Access token refreshed"
       )
     )
   } catch (error) {
      throw new ApiError(401,error?.message || "Invalid refresh token")
   }
})


export { registerUser , loginUser,logoutUser,refreshAcessToken};
