import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
  import { UserDto } from './dto/user.dto';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Tag } from '../tag/entities/tag.entity';


@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
  ) {}

  async create(createPostDto: CreatePostDto, userRequest: any) {
    const { slug, tags: tagIds, ...rest } = createPostDto;
    const existing = await this.postRepo.findOne({ where: { slug } });
    if (existing) {
      throw new BadRequestException('Slug already exists');
    }

    const tags = await this.tagRepo.findBy({ id: In([tagIds]) });
    if (tags.length !== tagIds.length) {
      throw new NotFoundException('Tags not found');
    }

    const post = this.postRepo.create({
      ...rest,
      slug,
      authorId: userRequest.id,
      tags,
    });

    const savedPost = await this.postRepo.save(post);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Success',
      data: savedPost,
    };
  }

  async findAll(page = 1, itemsPerPage = 20, sortDesc = true) {
    const [data, total] = await this.postRepo.findAndCount({
      order: { id: sortDesc ? 'DESC' : 'ASC' },
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
      relations: ['tags','user'],
    });

    const postsWithSafeUser = data.map(post => {
      const { password, phone, avatar, createdAt, updatedAt, ...safeUser } = post.user;

      return {
        ...post,
        user: safeUser as UserDto, 
      };
    });

    return {
      data: {
        count: total,
        list: postsWithSafeUser,
      },
    };
  }

  async findOneBySlug(slug: string) {
    const post = await this.postRepo.findOne({
      where: { slug },
      relations: ['tags','user'],
    });

    if (!post) throw new NotFoundException('Post not found');

    const { password, phone, avatar, createdAt, updatedAt, ...safeUser } = post.user;

    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: {
        ...post,
        user: safeUser as UserDto,
      },
    };
  }

  async findOneById(id: number) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['tags','user'],
    });

    if (!post) throw new NotFoundException('Post not found');

    const { password, phone, avatar, createdAt, updatedAt, ...safeUser } = post.user;


    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: {
        ...post,
        user: safeUser as UserDto,
      },
    };
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    const { tags, ...rest } = updatePostDto;

    let tagEntities = [];
    if (tags && tags.length) {
      tagEntities = await this.tagRepo.findBy({ id: In(tags) });
    }

    const updatedPost = this.postRepo.merge(post, {
      ...rest,
      tags: tagEntities,
    });
    const savedPost = await this.postRepo.save(updatedPost);

    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: savedPost,
    };
  }

  async remove(id: number) {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    const result = await this.postRepo.remove(post);

    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: result,
    };
  }
}
