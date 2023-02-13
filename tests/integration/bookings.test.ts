import supertest from 'supertest';
import app, { init } from '@/app';
import { cleanDb, generateValidToken } from '../helpers';
import * as jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import {
  createEnrollmentWithAddress,
  createEnrollmentWithAddressAndUser,
  createHotel,
  createRoomWithHotelId,
  createRoomWithHotelIdAndCapacity,
  createTicket,
  createTicketType,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
  createTicketTypeWithoutHotel,
  createUser,
} from '../factories';
import faker from '@faker-js/faker';
import { createBooking, getBookingFactory } from '../factories/bookings-factory';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 if user does not have booked', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and return the user's booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const booking = await createBooking(room.id, user.id);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);

      expect(response.body).toEqual({
        id: booking.id,
        userId: booking.userId,
        roomId: booking.roomId,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
        Room: {
          id: booking.Room.id,
          name: booking.Room.name,
          capacity: booking.Room.capacity,
          hotelId: booking.Room.hotelId,
          createdAt: booking.Room.createdAt.toISOString(),
          updatedAt: booking.Room.updatedAt.toISOString(),
        },
      });
    });
  });
});

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe('when token is valid', () => {
    const generateValidBody = (roomId: number) => ({
      roomId,
    });

    it('should respond with status 404 if roomId was not given', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const body = generateValidBody(room.id);

      delete body.roomId;

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    it("should respond with status 404 if user's enrollment was not found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const body = generateValidBody(room.id);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    it("should respond with status 404 if user's ticket was not found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      console.log(enrollment);

      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const body = generateValidBody(room.id);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    it("should respond with status 403 if user's ticket type does not include hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddressAndUser(user);
      console.log(enrollment);

      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const body = generateValidBody(room.id);

      const ticketType = await createTicketTypeWithoutHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
    it("should respond with status 403 if user's ticket type is remote", async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);

      const token = await generateValidToken(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const body = generateValidBody(room.id);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
    it("should respond with status 403 if user's ticket type is not paid", async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);

      const token = await generateValidToken(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, 'RESERVED');
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const body = generateValidBody(room.id);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
    it('should respond with status 403 if chosen room is out of capacity', async () => {
      const user1 = await createUser();
      const hotel = await createHotel();
      const room = await createRoomWithHotelIdAndCapacity(hotel.id, 1);

      const booking1 = await createBooking(room.id, user1.id);

      const user2 = await createUser();
      const enrollment = await createEnrollmentWithAddress(user2);

      const token = await generateValidToken(user2);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
      const body = generateValidBody(room.id);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 201 and create a new booking', async () => {
      const user1 = await createUser();
      const hotel = await createHotel();
      const room = await createRoomWithHotelIdAndCapacity(hotel.id, 2);

      const booking1 = await createBooking(room.id, user1.id);

      const user2 = await createUser();
      const enrollment = await createEnrollmentWithAddress(user2);
      const token = await generateValidToken(user2);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
      const body = generateValidBody(room.id);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      const booking2 = await getBookingFactory(user2.id);

      expect(response.status).toEqual(httpStatus.CREATED);
      expect(response.body).toEqual(booking2.id);
    });
  });
});

describe('PUT /booking/:bookingId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe('when token is valid', () => {
    const generateValidBody = (roomId: number) => ({
      roomId,
    });

    it('should respond with status 404 if roomId was not found', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const body = generateValidBody(room.id + 19241);
      const booking = await createBooking(room.id, user.id);

      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 if user had not booked before', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const userDB = await createUser();
      const bookingDB = await createBooking(room.id, userDB.id);

      const body = generateValidBody(room.id);

      const response = await server.put(`/booking/${bookingDB.id}`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if chosen room is out of capacity', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room1 = await createRoomWithHotelId(hotel.id);
      const room2 = await createRoomWithHotelIdAndCapacity(hotel.id, 0);

      const booking = await createBooking(room1.id, user.id);

      const body = generateValidBody(room2.id);

      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 201 and change roomId from booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room1 = await createRoomWithHotelId(hotel.id);
      const room2 = await createRoomWithHotelIdAndCapacity(hotel.id, 1);

      const booking = await createBooking(room1.id, user.id);

      const body = generateValidBody(room2.id);

      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual(booking.id);
    });
  });
});

const server = supertest(app);
