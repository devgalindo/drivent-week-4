import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';
import { Response } from 'express';
import httpStatus from 'http-status';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = await bookingService.getBooking(Number(userId));

    res.status(httpStatus.OK).send(booking);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { roomId } = req.body;
  const { userId } = req;
  console.log('roomId', roomId);
  console.log('userId', userId);

  if (!roomId) {
    console.log('roomId not found');

    return res.sendStatus(httpStatus.NOT_FOUND);
  }

  try {
    const booking = await bookingService.postBooking(userId, roomId);

    return res.status(httpStatus.CREATED).send(booking.id);
  } catch (error) {
    if (error.name === 'EnrollmentNotFoundError' || error.name === 'TicketNotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === 'InvalidTicketError' || error.name === 'RoomOutOfCapacityError') {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
  }
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
  const { roomId } = req.body;
  const { bookingId } = req.params;
  const { userId } = req;

  try {
    const booking = await bookingService.putBooking(Number(roomId), userId, Number(bookingId));

    return res.status(httpStatus.CREATED).send(booking.id);
  } catch (error) {
    if (error.name === 'RoomOutOfCapacityError' || error.name === 'UserHasNotBookedError') {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    if (error.name === 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  }
}
