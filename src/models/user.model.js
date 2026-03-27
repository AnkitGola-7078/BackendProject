import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,//to remove extra spaces
        index:true//to create index for faster search
    },
    email:{ 
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,

    },
    fullname:{
        type:String,
        required:true,
        index:true,
        trim:true
    },
    avatar:{
        type:String,
        required:true,
     },
     coverImage:{
        type:String,
     },
     watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Video',
        }
     ],
     password:{
        type:String,
        required:[true,'Password is required'],
     },
     refreshToken:{
        type:String,
     }
},{timestamps:true});

//pre hook to hash password before saving user document
userSchema.pre('save',async function(){
    if(!this.isModified('password')) return ;
    this.password=await bcrypt.hash(this.password,10);
    
});

//iye password ko verify karne ke liye method hai jo user instance pe call kiya ja sakta hai
userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password);
}

//method to generate JWT token for authentication
userSchema.methods.generateRefreshToken=function(){
  return jwt.sign(
    {
        _id:this._id,
    },
      process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    }
  );
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

export const User=mongoose.model('User',userSchema);
