import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryConfig = () => {
  cloudinary.config({
    cloud_name: 'dmdncwenn',
    api_key: '439844648354892',
    api_secret: '0wMJxBSqr72HNGUgktfvq5tBz5s',
  });
};
