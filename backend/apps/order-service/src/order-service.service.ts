import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { UserOrderRepository } from './order-service.repository';
import { CreateUserOrderDto, GetUserOrderDto } from './dto';

@Injectable()
export class OrderServiceService {
  constructor(private readonly userOrderRepository: UserOrderRepository) {}
  async create(createUserOrderDto: CreateUserOrderDto) {
    try {
      await this.userOrderRepository.findOne({
        phone_number: createUserOrderDto.phone_number,
      });
    } catch (error) {
      return this.userOrderRepository.create(createUserOrderDto);
    }
    return this.update(
      createUserOrderDto.phone_number,
      createUserOrderDto.productsIds,
    );
  }

  async findAll() {
    return this.userOrderRepository.find({});
  }

  async findOne(_id: GetUserOrderDto) {
    return this.userOrderRepository.findOne({ _id });
  }

  async update(phone_number: string, productsIds: string[]) {
    return this.userOrderRepository.findOneAndUpdate(
      { phone_number },
      { $push: { productsIds: { $each: productsIds } } },
    );
  }
}
