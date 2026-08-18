// app/src/seeders/movie-status.seeder.ts

import MovieStatus from '../models/movie-status.model';

/**
 * Seeder para los estados de películas
 */
export async function seedMovieStatuses(): Promise<void> {
  try {
    const statuses = [
      {
        name: 'Próximamente',
        description: 'Película próxima a estrenarse',
      },
      {
        name: 'En Estreno',
        description: 'Película actualmente en cartelera',
      },
    ];

    for (const status of statuses) {
      const existingStatus = await MovieStatus.findOne({
        where: { name: status.name },
      });

      if (!existingStatus) {
        await MovieStatus.create(status);
        console.log(`✓ Estado de película creado: ${status.name}`);
      } else {
        console.log(`- Estado de película ya existe: ${status.name}`);
      }
    }

    console.log('✓ Seeding de estados de películas completado');
  } catch (error) {
    console.error('✗ Error en el seeding de estados de películas:', error);
    throw error;
  }
}
