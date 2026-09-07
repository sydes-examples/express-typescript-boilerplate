import { HttpError } from 'routing-controllers';

export class InvalidPetAgeError extends HttpError {
    constructor() {
        super(400, 'Pet age must be a positive number!');
    }
}
