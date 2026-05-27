import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('topics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TEACHER', 'ADMIN', 'SUPERADMIN')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post()
  create(@Body() createTopicDto: CreateTopicDto, @Request() req) {
    return this.topicsService.create(createTopicDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.topicsService.findAllByTeacher(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.topicsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto, @Request() req) {
    return this.topicsService.update(id, updateTopicDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.topicsService.remove(id, req.user.userId);
  }
}
