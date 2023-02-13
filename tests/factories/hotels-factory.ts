import faker from '@faker-js/faker';
import { prisma } from '@/config';

//Sabe criar objetos - Hotel do banco
export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createRoomWithHotelId(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.datatype.number({ min: 100, max: 999 }).toString(),
      capacity: faker.datatype.number({ min: 1, max: 3 }),
      hotelId,
    },
  });
}

export async function createRoomWithHotelIdAndCapacity(hotelId: number, capacity: number) {
  return prisma.room.create({
    data: {
      name: faker.datatype.number({ min: 100, max: 999 }).toString(),
      capacity,
      hotelId,
    },
  });
}
