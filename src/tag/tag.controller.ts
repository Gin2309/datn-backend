import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorators';
import { UserRole } from '../common/enum';

@ApiTags('tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagService.create(createTagDto);
  }

  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({
    name: 'itemsPerPage',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiQuery({ name: 'sortDesc', required: false, type: Boolean })
  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('itemsPerPage') itemsPerPage = 20,
    @Query('sortDesc') sortDesc = true,
  ) {
    return this.tagService.findAll(
      Number(page),
      Number(itemsPerPage),
      sortDesc,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.tagService.findOne(+id);
    return { data: result };
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.EMPLOYEE)
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagService.update(+id, updateTagDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.EMPLOYEE)
  remove(@Param('id') id: string) {
    return this.tagService.remove(+id);
  }
}
