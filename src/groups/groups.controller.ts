import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Roles('SUPERADMIN', 'ADMIN')
  @Post()
  create(@Body() createGroupDto: CreateGroupDto, @Request() req: any) {
    return this.groupsService.create(createGroupDto, req.user.userId);
  }

  // Todos pueden ver los grupos (Profesores necesitan verlos para seleccionarlos)
  @Get()
  findAll(@Request() req: any) {
    const userId = req.user.userId;
    const userRole = req.user.roles[0].name;
    return this.groupsService.findAll(userId, userRole);
  }

  @Get(':id')
  @Roles('SUPERADMIN', 'ADMIN')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Roles('SUPERADMIN', 'ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Roles('SUPERADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }
}
