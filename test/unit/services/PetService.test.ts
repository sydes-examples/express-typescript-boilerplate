import { InvalidPetAgeError } from '../../../src/api/errors/InvalidPetAgeError';
import { Pet } from '../../../src/api/models/Pet';
import { PetService } from '../../../src/api/services/PetService';
import { events } from '../../../src/api/subscribers/events';
import { EventDispatcherMock } from '../lib/EventDispatcherMock';
import { LogMock } from '../lib/LogMock';
import { RepositoryMock } from '../lib/RepositoryMock';

describe('PetService', () => {

    test('Create should dispatch subscribers', async (done) => {
        const log = new LogMock();
        const repo = new RepositoryMock();
        const ed = new EventDispatcherMock();
        const pet = new Pet();
        pet.name = 'Rex';
        pet.age = 3;
        const petService = new PetService(repo as any, ed as any, log);
        const newPet = await petService.create(pet);
        expect(ed.dispatchMock).toBeCalledWith([events.pet.created, newPet]);
        done();
    });

    test('Create should reject a non-positive age', async (done) => {
        const log = new LogMock();
        const repo = new RepositoryMock();
        const ed = new EventDispatcherMock();
        const pet = new Pet();
        pet.name = 'Rex';
        pet.age = 0;
        const petService = new PetService(repo as any, ed as any, log);
        const expectedError = new InvalidPetAgeError();

        // `HttpError`'s own constructor (routing-controllers) resets the
        // thrown instance's prototype to `HttpError.prototype`, so
        // `instanceof InvalidPetAgeError` cannot distinguish it from any
        // other HttpError — the same limitation already applies to the
        // repository's existing PetNotFoundError/UserNotFoundError. Asserting
        // on httpCode/message is what actually proves the right error.
        await expect(petService.create(pet)).rejects.toMatchObject({
            httpCode: expectedError.httpCode,
            message: expectedError.message,
        });
        expect(repo.saveMock).not.toBeCalled();
        done();
    });

});
