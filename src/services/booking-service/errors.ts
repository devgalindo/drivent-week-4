import { ApplicationError } from "@/protocols";

export function enrollmentNotFoundError(): ApplicationError {
  return {
    name: "EnrollmentNotFoundError",
    message: "User Enrollment Not Found. You can't make a booking.",
  };
}

export function ticketNotFoundError(): ApplicationError {
    return {
      name: "TicketNotFoundError",
      message: "User Ticket Not Found. You can't make a booking.",
    };
  }

export function invalidTicketError(): ApplicationError {
  return {
    name: "InvalidTicketError",
    message: "Your ticket is invalid. Verify if it includes Hotel, is not remote and was paid before making a booking",
  };
}

export function roomOutOfCapacityError(): ApplicationError {
    return {
      name: "RoomOutOfCapacityError",
      message: "The room you are choosing is out of capacity. You have to choose another.",
    };
  }

export function userHasNotBookedError(): ApplicationError {
    return {
        name: "UserHasNotBookedError",
        message: "You can't change the room if you have not booked anyone before.",
    };
}