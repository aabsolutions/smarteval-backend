import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
export declare class InstitutionsController {
    private readonly institutionsService;
    constructor(institutionsService: InstitutionsService);
    create(createInstitutionDto: CreateInstitutionDto): Promise<import("./schemas/institution.schema").Institution>;
    findAll(): Promise<import("./schemas/institution.schema").Institution[]>;
    findOne(id: string): Promise<import("./schemas/institution.schema").Institution>;
    update(id: string, updateInstitutionDto: UpdateInstitutionDto): Promise<import("./schemas/institution.schema").Institution>;
    remove(id: string): Promise<import("./schemas/institution.schema").Institution>;
}
