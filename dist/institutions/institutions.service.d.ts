import { Model } from 'mongoose';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { Institution } from './schemas/institution.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class InstitutionsService {
    private institutionModel;
    private readonly cloudinaryService;
    constructor(institutionModel: Model<Institution>, cloudinaryService: CloudinaryService);
    create(createInstitutionDto: CreateInstitutionDto, files?: {
        logo?: Express.Multer.File[];
        cover?: Express.Multer.File[];
    }): Promise<Institution>;
    findAll(): Promise<Institution[]>;
    findOne(id: string): Promise<Institution>;
    update(id: string, updateInstitutionDto: UpdateInstitutionDto, files?: {
        logo?: Express.Multer.File[];
        cover?: Express.Multer.File[];
    }): Promise<Institution>;
    remove(id: string): Promise<Institution>;
}
