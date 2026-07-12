import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Post()
  @Roles('SUPERADMIN')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'logo', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]))
  create(
    @Body() createInstitutionDto: CreateInstitutionDto,
    @UploadedFiles() files?: { logo?: Express.Multer.File[], cover?: Express.Multer.File[] }
  ) {
    return this.institutionsService.create(createInstitutionDto, files);
  }

  @Get()
  @Roles('ADMIN', 'SUPERADMIN')
  findAll() {
    return this.institutionsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPERADMIN')
  findOne(@Param('id') id: string) {
    return this.institutionsService.findOne(id);
  }

  @Put(':id')
  @Roles('SUPERADMIN')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'logo', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]))
  update(
    @Param('id') id: string, 
    @Body() updateInstitutionDto: UpdateInstitutionDto,
    @UploadedFiles() files?: { logo?: Express.Multer.File[], cover?: Express.Multer.File[] }
  ) {
    return this.institutionsService.update(id, updateInstitutionDto, files);
  }

  @Delete(':id')
  @Roles('SUPERADMIN')
  remove(@Param('id') id: string) {
    return this.institutionsService.remove(id);
  }
}
