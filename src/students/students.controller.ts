import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateBulkStudentsDto } from './dto/create-bulk-students.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Roles('SUPERADMIN', 'ADMIN')
  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Roles('SUPERADMIN', 'ADMIN')
  @Post('bulk')
  createBulk(@Body() createBulkDto: CreateBulkStudentsDto) {
    return this.studentsService.createBulk(createBulkDto.students);
  }

  @Roles('SUPERADMIN', 'ADMIN', 'TEACHER')
  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Roles('SUPERADMIN', 'ADMIN', 'TEACHER')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Roles('SUPERADMIN', 'ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Roles('SUPERADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
