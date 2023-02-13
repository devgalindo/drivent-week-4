import { notFoundError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';
import { Booking } from '@prisma/client';
import {
  enrollmentNotFoundError,
  invalidTicketError,
  roomOutOfCapacityError,
  ticketNotFoundError,
  userHasNotBookedError,
} from './errors';

async function getBooking(userId: number) {
  const userBooking = await bookingRepository.getBooking(userId);

  if (!userBooking) {
    throw notFoundError();
  }

  return userBooking;
}

async function postBooking(userId: number, roomId: number) {
  await verifyUserAuthorization(userId);
  await verifyRoomCapacity(roomId);

  const booking = await bookingRepository.postBooking(userId, roomId);

  return booking;
}

async function verifyUserAuthorization(userId: number) {
  const enrollment = await bookingRepository.getEnrollmentByUserId(userId);
  console.log('enrollment', enrollment);

  if (!enrollment) {
    console.log('enrollmentNotFoundError');

    throw enrollmentNotFoundError();
  }

  const ticket = await bookingRepository.getUserTicketByEnrollmentId(enrollment.id);
  console.log('ticket', ticket);

  if (!ticket) {
    console.log('ticketNotFoundError');

    throw ticketNotFoundError();
  }

  if (!ticket.TicketType.includesHotel || ticket.TicketType.isRemote || ticket.status === 'RESERVED') {
    console.log('invalidTicketError');

    throw invalidTicketError();
  }
}

async function verifyRoomCapacity(roomId: number) {
  const bookings = await bookingRepository.getNumberOfRoomBooking(roomId);

  const capacity = await bookingRepository.getRoomCapacity(roomId);

  if (bookings >= capacity) {
    throw roomOutOfCapacityError();
  }
}

async function putBooking(userId: number, roomId: number, bookingId: number) {
  await verifyIfUserHasBooked(userId);
  await verifyRoomIdExistence(roomId);
  await verifyRoomCapacity(roomId);

  const booking = bookingRepository.putBooking(bookingId, roomId);

  return booking;
}

async function verifyRoomIdExistence(roomId: number) {
  const room = await bookingRepository.findRoomByRoomId(roomId);

  if (!room) {
    throw notFoundError();
  }
}

async function verifyIfUserHasBooked(userId: number) {
  const hasUserReservation = await bookingRepository.getBooking(userId);

  if (!hasUserReservation) {
    throw userHasNotBookedError();
  }
}

const bookingService = {
  getBooking,
  postBooking,
  putBooking,
};

export type BookingParams = Pick<Booking, 'roomId'>;

export default bookingService;
