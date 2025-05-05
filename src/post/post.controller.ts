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
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorators';
import { UserRole } from '../common/enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { getUser } from '../common/decorators/users.decorators';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.EMPLOYEE)
  create(@getUser() userRequest, @Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto, userRequest);
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
    return this.postService.findAll(
      Number(page),
      Number(itemsPerPage),
      sortDesc,
    );
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const result = await this.postService.findOneBySlug(slug);
    return { data: result };
  }

  @Get('id/:id')
  async findOne(@Param('id') id: string) {
    const result = await this.postService.findOneById(+id);
    return { data: result };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.EMPLOYEE)
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(+id, updatePostDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.EMPLOYEE)
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
