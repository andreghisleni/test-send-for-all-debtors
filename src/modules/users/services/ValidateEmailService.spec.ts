import { v4 as uuid } from 'uuid';
import { describe, it, beforeEach, expect } from 'vitest';

import AppError from '@shared/errors/AppError';

import { FakeUsersRepository } from '../repositories/fakes/FakeUsersRepository';
import { FakeUserTokensRepository } from '../repositories/fakes/FakeUserTokensRepository';
import { ValidateEmailService } from './ValidateEmailService';

let fakeUsersRepository: FakeUsersRepository;
let fakeUserTokensRepository: FakeUserTokensRepository;

let validateEmail: ValidateEmailService;

describe('ValidateEmail', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeUserTokensRepository = new FakeUserTokensRepository();

    validateEmail = new ValidateEmailService(
      fakeUsersRepository,
      fakeUserTokensRepository,
    );
  });

  it('should be able to validate email', async () => {
    const user = await fakeUsersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      user: 'john',
      phone: '99999999999',
      password: '123456',
    });
    const { token } = await fakeUserTokensRepository.generate(user);
    const userValidated = await validateEmail.execute({ token });

    expect(userValidated.active).toBeTruthy();
  });
  it('should not be able to validate an already validated email', async () => {
    const user = await fakeUsersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      user: 'john',
      phone: '99999999999',
      password: '123456',
    });
    const { token } = await fakeUserTokensRepository.generate(user);
    await validateEmail.execute({ token });

    await expect(validateEmail.execute({ token })).rejects.toBeInstanceOf(
      AppError,
    );
  });
  it('should not be able to validate email with invalid token', async () => {
    await expect(
      validateEmail.execute({ token: uuid() }),
    ).rejects.toBeInstanceOf(AppError);

    const user = new User();
    user.id = uuid();
    const { token } = await fakeUserTokensRepository.generate(user);

    await expect(validateEmail.execute({ token })).rejects.toBeInstanceOf(
      AppError,
    );
  });
});
