"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstitutionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const institution_schema_1 = require("./schemas/institution.schema");
let InstitutionsService = class InstitutionsService {
    constructor(institutionModel) {
        this.institutionModel = institutionModel;
    }
    async create(createInstitutionDto) {
        const existing = await this.institutionModel.findOne({ name: createInstitutionDto.name }).exec();
        if (existing) {
            throw new common_1.ConflictException(`Institution with name ${createInstitutionDto.name} already exists`);
        }
        const createdInstitution = new this.institutionModel(createInstitutionDto);
        return createdInstitution.save();
    }
    async findAll() {
        return this.institutionModel.find().exec();
    }
    async findOne(id) {
        const institution = await this.institutionModel.findById(id).exec();
        if (!institution) {
            throw new common_1.NotFoundException(`Institution with ID ${id} not found`);
        }
        return institution;
    }
    async update(id, updateInstitutionDto) {
        const updatedInstitution = await this.institutionModel
            .findByIdAndUpdate(id, updateInstitutionDto, { new: true })
            .exec();
        if (!updatedInstitution) {
            throw new common_1.NotFoundException(`Institution with ID ${id} not found`);
        }
        return updatedInstitution;
    }
    async remove(id) {
        const deletedInstitution = await this.institutionModel.findByIdAndDelete(id).exec();
        if (!deletedInstitution) {
            throw new common_1.NotFoundException(`Institution with ID ${id} not found`);
        }
        return deletedInstitution;
    }
};
exports.InstitutionsService = InstitutionsService;
exports.InstitutionsService = InstitutionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(institution_schema_1.Institution.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], InstitutionsService);
//# sourceMappingURL=institutions.service.js.map