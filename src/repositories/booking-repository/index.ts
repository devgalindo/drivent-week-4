import { prisma } from "@/config"

async function getBooking(userId: number) {
    return prisma.booking.findFirst({
        where: {userId},
        include: {Room: true}
    })
}

async function postBooking(userId: number, roomId: number) {
    return prisma.booking.create({
        data: {
            userId,
            roomId
        }
    })
}

async function getEnrollmentByUserId(userId: number) {
    return prisma.enrollment.findFirst({
        where: {userId},
    })
}

async function getUserTicketByEnrollmentId(enrollmentId: number) {
    return prisma.ticket.findFirst({
        where: {enrollmentId},
        include: {TicketType: true}
    })
}

async function getNumberOfRoomBooking(roomId: number) {
    const bookings = await prisma.booking.findMany({
        where:{
            id: roomId
        }
    })
    return bookings.length
}

async function getRoomCapacity(roomId: number) {
    const room = await prisma.room.findFirst({
        where: {id: roomId}
    })
    return room.capacity
}

async function putBooking(bookingId: number, roomId: number) {
    return prisma.booking.update({
        where:{
            id: bookingId
        },
        data:{
            roomId
        }
    })
}

const bookingRepository = {
    getBooking,
    postBooking,
    getEnrollmentByUserId,
    getUserTicketByEnrollmentId,
    getNumberOfRoomBooking,
    getRoomCapacity,
    putBooking
}

export default bookingRepository
