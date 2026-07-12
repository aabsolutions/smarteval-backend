import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { Institution } from './schemas/institution.schema';

import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class InstitutionsService {
  constructor(
    @InjectModel(Institution.name) private institutionModel: Model<Institution>,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async create(createInstitutionDto: CreateInstitutionDto, files?: { logo?: Express.Multer.File[], cover?: Express.Multer.File[] }): Promise<Institution> {
    const existing = await this.institutionModel.findOne({ name: createInstitutionDto.name }).exec();
    if (existing) {
      throw new ConflictException(`Institution with name ${createInstitutionDto.name} already exists`);
    }

    if (files?.logo && files.logo.length > 0) {
      const uploadResult = await this.cloudinaryService.uploadImage(files.logo[0], 'smarteval/institutions');
      createInstitutionDto.logoUrl = uploadResult.secure_url;
    }
    
    if (files?.cover && files.cover.length > 0) {
      const uploadResult = await this.cloudinaryService.uploadImage(files.cover[0], 'smarteval/institutions');
      createInstitutionDto.coverUrl = uploadResult.secure_url;
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

  async update(id: string, updateInstitutionDto: UpdateInstitutionDto, files?: { logo?: Express.Multer.File[], cover?: Express.Multer.File[] }): Promise<Institution> {
    if (files?.logo && files.logo.length > 0) {
      const uploadResult = await this.cloudinaryService.uploadImage(files.logo[0], 'smarteval/institutions');
      updateInstitutionDto.logoUrl = uploadResult.secure_url;
    }
    
    if (files?.cover && files.cover.length > 0) {
      const uploadResult = await this.cloudinaryService.uploadImage(files.cover[0], 'smarteval/institutions');
      updateInstitutionDto.coverUrl = uploadResult.secure_url;
    }

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
