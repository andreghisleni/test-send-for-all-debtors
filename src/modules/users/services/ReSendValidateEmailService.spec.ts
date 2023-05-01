import { describe, it, beforeEach, expect, vi } from 'vitest';

import { FakeMailProvider } from '@shared/container/providers/MailProvider/fakes/FakeMailProvider';
import AppError from '@shared/errors/AppError';

import { FakeUsersRepository } from '../repositories/fakes/FakeUsersRepository';
import { FakeUserTokensRepository } from '../repositories/fakes/FakeUserTokensRepository';
import { ReSendValidateEmailService } from './ReSendValidateEmailService';

let fakeUsersRepository: FakeUsersRepository;
let fakeUserTokensRepository: FakeUserTokensRepository;
let fakeMailProvider: FakeMailProvider;

let reSendValidateEmail: ReSendValidateEmailService;

describe('ReSendValidateEmailServic', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeMailProvider = new FakeMailProvider();
    fakeUserTokensRepository = new FakeUserTokensRepository();

    reSendValidateEmail = new ReSendValidateEmailService(
      fakeUsersRepository,
      fakeMailProvider,
      fakeUserTokensRepository,
    );
  });
  it('should be able to send validate email', async () => {
    const sendMail = vi.spyOn(fakeMailProvider, 'sendMail');

    const user = await fakeUsersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      user: 'john',
      phone: '99999999999',
      password: '123456',
    });

    await reSendValidateEmail.execute({
      id: user.id,
    });
    expect(sendMail).toHaveBeenCalled();
  });
  it('should be able to send too emails validate email', async () => {
    const sendMail = vi.spyOn(fakeMailProvider, 'sendMail');

    const user = await fakeUsersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      user: 'john',
      phone: '99999999999',
      password: '123456',
    });

    await reSendValidateEmail.execute({
      id: user.id,
    });
    await reSendValidateEmail.execute({
      id: user.id,
    });
    expect(sendMail).toHaveBeenCalled();
  });
  it('should not be able to validate email with verified user', async () => {
    const user = await fakeUsersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      user: 'john',
      phone: '99999999999',
      password: '123456',
    });

    user.active = true;
    await fakeUsersRepository.save(user);

    await expect(
      reSendValidateEmail.execute({
        id: user.id,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
  it('should not be able to validate email with user id invalid', async () => {
    await expect(
      reSendValidateEmail.execute({
        id: '9f88a31d-04e0-4711-83ec-ac258d3e9ff2',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
