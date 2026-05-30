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
  Query,
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
  async findAll(@Request() req: any, @Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    const userRole = req.user.roles[0].name;
    // SUPERADMIN can see everyone. ADMIN can only see TEACHER and STUDENT.
    const allowedRoles = userRole === 'SUPERADMIN' 
      ? ['SUPERADMIN', 'ADMIN', 'TEACHER', 'STUDENT'] 
      : ['TEACHER', 'STUDENT'];
    
    return this.usersService.findAll(allowedRoles, parseInt(page), parseInt(limit));
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

  @Roles('SUPERADMIN', 'ADMIN')
  @Post(':id/reset-password')
  async resetPassword(@Param('id') id: string, @Request() req: any) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User not found');

    this.checkPermissions(req.user.roles[0].name, user.roles[0].name);

    return this.usersService.resetPassword(id);
  }

  // Endpoints for regular users to manage their own profile
  @Put('me/profile')
  async updateProfile(@Body() updateData: any, @Request() req: any) {
    const userId = req.user.sub || req.user.id || req.user._id;
    // Evitar que actualicen su rol o su cedula
    delete updateData.roles;
    delete updateData.cedula;
    delete updateData.password;
    
    return this.usersService.update(userId, updateData);
  }

  @Put('me/change-password')
  async changePassword(@Body() passData: any, @Request() req: any) {
    const userId = req.user.sub || req.user.id || req.user._id;
    return this.usersService.changePassword(userId, passData.currentPassword, passData.newPassword);
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
