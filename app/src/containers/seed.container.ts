// app/src/containers/seed.container.ts

import { SeedController } from '../controllers/seed.controller.js';
import SeedService from '../services/seed.service.js';

const seedService = new SeedService();
export const seedController = new SeedController(seedService);
