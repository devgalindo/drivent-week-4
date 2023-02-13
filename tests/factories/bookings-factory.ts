import { prisma } from '@/config';

export async function createBooking(roomId: number, userId: number) {
  const booking = await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });

  return prisma.booking.findFirst({
    where: {
      userId,
    },
    include: {
      Room: true,
    },
  });
}

export async function getBookingFactory(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
  });
}
