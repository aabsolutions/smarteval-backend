import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
export declare class CloudinaryService {
    uploadImage(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse>;
    deleteImage(publicId: string): Promise<any>;
}
