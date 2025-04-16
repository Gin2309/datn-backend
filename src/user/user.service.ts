import { hashSync } from 'bcrypt';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { removePassword } from '../utils';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, avatar, password, ...rest } = createUserDto;

    const existingUser = await this.userRepository.findOneBy({ email });

    if (!/\S+@\S+\.\S+/.test(createUserDto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    if (existingUser) {
      const message = `Email already exists.`;
      this.logger.warn(message);
      throw new BadRequestException(message);
    }

    const hashedPassword = await hashSync(password, 10);

    const user = this.userRepository.create({
      ...rest,
      email,
      password: hashedPassword,
      avatar: avatar || '',
    });

    return this.userRepository.save(user);
  }

  async findAll(page = 1, itemsPerPage = 20, sortDesc = true): Promise<any[]> {
    const [data] = await this.userRepository.findAndCount({
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
      order: {
        createdAt: sortDesc ? 'DESC' : 'ASC',
      },
    });

    return data.map((user) => removePassword(user));
  }

  async count(): Promise<number> {
    const [, total] = await this.userRepository.findAndCount();
    return total;
  }

  async findOne(id: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return removePassword(user);
  }

  async findOneByEmail(email: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    const allowedFields = ['name', 'email', 'phone', 'avatar', 'role'];
    const filteredData = Object.fromEntries(
      Object.entries(updateUserDto).filter(([key]) =>
        allowedFields.includes(key),
      ),
    );

    const updatedUser = this.userRepository.merge(user, filteredData);
    const savedUser = await this.userRepository.save(updatedUser);
    return {
      statusCode: 200,
      message: 'Success',
      data: removePassword(savedUser),
    };
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    await this.userRepository.delete(id);
  }
}
