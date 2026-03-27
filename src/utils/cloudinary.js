import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary with your credentials from environment variables
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary=async (localFilePath)=>{
    try{
        if(!localFilePath) return null;

        // Upload the file to Cloudinary
        const result = await cloudinary.uploader.upload(localFilePath, {resource_type:'auto'});
       // console.log("file is uploaded to cloudinary successfully",result.url);
         fs.unlinkSync(localFilePath); // Delete the local file after successful upload
         return result;

    } catch (error) {
        fs.unlinkSync(localFilePath); // Delete the local file in case of an error
        return null;
    }
};

export {uploadToCloudinary as uploadCloudinary};