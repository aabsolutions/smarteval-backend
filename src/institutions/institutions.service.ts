import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { Institution } from './schemas/institution.schema';

@Injectable()
export class InstitutionsService {
  constructor(@InjectModel(Institution.name) private institutionModel: Model<Institution>) {}

  async create(createInstitutionDto: CreateInstitutionDto): Promise<Institution> {
    const existing = await this.institutionModel.findOne({ name: createInstitutionDto.name }).exec();
    if (existing) {
      throw new ConflictException(`Institution with name ${createInstitutionDto.name} already exists`);
    }
    const createdInstitution = new this.institutionModel(createInstitutionDto);
    return createdInstitution.save();
  }

  async findAll(): Promise<Institution[]> {
    return this.institutionModel.find().exec();
  }

  async findOne(id: string): Promise<Institution> {
    const institution = await this.institutionModel.findById(id).exec();
    if (!institution) {
      throw new NotFoundException(`Institution with ID ${id} not found`);
    }
    return institution;
  }

  async update(id: string, updateInstitutionDto: UpdateInstitutionDto): Promise<Institution> {
    const updatedInstitution = await this.institutionModel
      .findByIdAndUpdate(id, updateInstitutionDto, { new: true })
      .exec();
    if (!updatedInstitution) {
      throw new NotFoundException(`Institution with ID ${id} not found`);
    }
    return updatedInstitution;
  }

  async remove(id: string): Promise<Institution> {
    const deletedInstitution = await this.institutionModel.findByIdAndDelete(id).exec();
    if (!deletedInstitution) {
      throw new NotFoundException(`Institution with ID ${id} not found`);
    }
    return deletedInstitution;
  }
}
