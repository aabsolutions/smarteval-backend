import { Model } from 'mongoose';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { Institution } from './schemas/institution.schema';
export declare class InstitutionsService {
    private institutionModel;
    constructor(institutionModel: Model<Institution>);
    create(createInstitutionDto: CreateInstitutionDto): Promise<Institution>;
    findAll(): Promise<Institution[]>;
    findOne(id: string): Promise<Institution>;
    update(id: string, updateInstitutionDto: UpdateInstitutionDto): Promise<Institution>;
    remove(id: string): Promise<Institution>;
}
