import { inject, injectable } from 'tsyringe';

import { IUser, IUsersRepository } from '../repositories/IUsersRepository';

// interface IRequest {
// }

@injectable()
export class FindAllUsersService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) { }// eslint-disable-line

  public async execute(/* {  }: IRequest */): Promise<IUser[]> {
    const users = await this.usersRepository.findAll();

    return users;
  }
}
