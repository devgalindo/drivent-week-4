import { bookingSchema } from "@/schemas";
import faker from "@faker-js/faker";

describe("createBookingSchema", () => {
    const generateValidInput = (roomId: number | string | boolean) => ({
        roomId
    })
    it("should return an error if input is not present", () => {
        const result = bookingSchema.validate(null);
    
        expect(result.error).toBeDefined();
      });

    it ("should return error if roomId is a string", () => {
        const roomId = faker.datatype.string()

        const input = generateValidInput(roomId)

        const result = bookingSchema.validate(input)

        expect(result.error).toBeDefined()
    }) 

    it ("should return error if roomId is a boolean", () => {
        const roomId = faker.datatype.boolean()

        const input = generateValidInput(roomId)

        const result = bookingSchema.validate(input)

        expect(result.error).toBeDefined()
    }) 

    it ("should return error if roomId is a boolean", () => {
        const roomId = faker.datatype.boolean()

        const input = generateValidInput(roomId)

        const result = bookingSchema.validate(input)

        expect(result.error).toBeDefined()
    }) 
})