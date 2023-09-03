import 'reflect-metadata';
import 'dotenv/config';

import '@shared/container';
import { container } from 'tsyringe';

import { prisma } from '../prisma';
import { Navigator } from './navigator';
import { Queue } from './queue';

const bootstrap = async () => {
  await prisma.$connect();
  const puppeteer = container.resolve(Navigator);

  await puppeteer.newBrowser();

  const queue = container.resolve(Queue);

  queue.run();
};

bootstrap();
