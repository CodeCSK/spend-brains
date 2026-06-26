import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category-request.dto';
import type { CategoryDto } from './dto/category-response.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(eventId: string): Promise<CategoryDto[]> {
    const categories = await this.prisma.eventExpenseCategory.findMany({
      where: { eventId },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
    return categories.map((c) => this.toDto(c));
  }

  async create(eventId: string, dto: CreateCategoryDto): Promise<CategoryDto> {
    const category = await this.prisma.eventExpenseCategory.create({
      data: { eventId, name: dto.name, icon: dto.icon, isDefault: false },
    });
    return this.toDto(category);
  }

  async update(
    eventId: string,
    categoryId: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryDto> {
    await this.getCategory(eventId, categoryId);
    const data: Prisma.EventExpenseCategoryUpdateInput = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.icon !== undefined && { icon: dto.icon }),
    };
    const category = await this.prisma.eventExpenseCategory.update({
      where: { id: categoryId },
      data,
    });
    return this.toDto(category);
  }

  async remove(eventId: string, categoryId: string): Promise<void> {
    await this.getCategory(eventId, categoryId);
    const referencing = await this.prisma.expense.count({
      where: { categoryId },
    });
    if (referencing > 0) {
      throw new ConflictException(
        'Cannot delete a category that has expenses; reassign them first',
      );
    }
    await this.prisma.eventExpenseCategory.delete({
      where: { id: categoryId },
    });
  }

  private async getCategory(eventId: string, categoryId: string) {
    const category = await this.prisma.eventExpenseCategory.findUnique({
      where: { id: categoryId },
      select: { id: true, eventId: true },
    });
    if (!category || category.eventId !== eventId) {
      throw new NotFoundException('Category not found in this event');
    }
    return category;
  }

  private toDto(category: {
    id: string;
    name: string;
    icon: string;
    isDefault: boolean;
  }): CategoryDto {
    return {
      id: category.id,
      name: category.name,
      icon: category.icon,
      isDefault: category.isDefault,
    };
  }
}
