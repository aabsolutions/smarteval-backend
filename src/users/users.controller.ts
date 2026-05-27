import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('SUPERADMIN', 'ADMIN')
  @Get()
  async findAll(@Request() req: any) {
    const userRole = req.user.roles[0].name;
    // SUPERADMIN can see everyone. ADMIN can only see TEACHER and STUDENT.
    const allowedRoles = userRole === 'SUPERADMIN' 
      ? ['SUPERADMIN', 'ADMIN', 'TEACHER', 'STUDENT'] 
      : ['TEACHER', 'STUDENT'];
    
    return this.usersService.findAll(allowedRoles);
  }

  @Roles('SUPERADMIN', 'ADMIN')
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User not found');

    this.checkPermissions(req.user.roles[0].name, user.roles[0].name);
    return user;
  }

  @Roles('SUPERADMIN', 'ADMIN')
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Request() req: any) {
    const targetRole = createUserDto.roles[0]?.name;
    this.checkPermissions(req.user.roles[0].name, targetRole);
    return this.usersService.create(createUserDto);
  }

  @Roles('SUPERADMIN', 'ADMIN')
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req: any) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User not found');

    // Comprobar si el usuario que llama tiene permiso sobre el usuario existente
    this.checkPermissions(req.user.roles[0].name, user.roles[0].name);

    // Comprobar si el usuario que llama tiene permiso sobre el nuevo rol que intenta asignar
    if (updateUserDto.roles && updateUserDto.roles.length > 0) {
      this.checkPermissions(req.user.roles[0].name, updateUserDto.roles[0].name);
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Roles('SUPERADMIN', 'ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User not found');

    this.checkPermissions(req.user.roles[0].name, user.roles[0].name);
    
    return this.usersService.delete(id);
  }

  /**
   * Valida si el rol que solicita la acción puede operar sobre el rol destino.
   */
  private checkPermissions(requesterRole: string, targetRole: string) {
    if (requesterRole === 'SUPERADMIN') {
      return true; // Superadmin puede todo
    }

    if (requesterRole === 'ADMIN') {
      // Admin no puede crear ni modificar a otro admin ni a un superadmin
      if (targetRole === 'SUPERADMIN' || targetRole === 'ADMIN') {
        throw new ForbiddenException(`ADMIN no puede gestionar usuarios con rol ${targetRole}`);
      }
      return true;
    }

    throw new ForbiddenException('No tienes permisos suficientes');
  }
}
