import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  async create(dto: CreateTagDto) {
    const tag = this.tagRepo.create(dto);
    return this.tagRepo.save(tag);
  }

  async findAll(page = 1, itemsPerPage = 20, sortDesc = true) {
    const [tags, total] = await this.tagRepo.findAndCount({
      order: { id: sortDesc ? 'DESC' : 'ASC' },
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: {
        count: total,
        list: tags,
      },
    };
  }

  async findOne(id: number) {
    const tag = await this.tagRepo.findOne({ where: { id } });
    if (!tag) throw new NotFoundException();
    return tag;
  }

  async update(id: number, dto: UpdateTagDto) {
    const tag = await this.findOne(id);
    Object.assign(tag, dto);
    return this.tagRepo.save(tag);
  }

  async remove(id: number) {
    const tag = await this.findOne(id);
    return this.tagRepo.remove(tag);
  }
}
