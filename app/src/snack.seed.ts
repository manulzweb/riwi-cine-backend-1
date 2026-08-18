// app/src/seed-snacks.ts

import { Snack } from './models/snack.model';
import sequelize from './config/database';

/**
 * Script de inyección manual de datos para Confitería
 * --------------------------------------------------
 * Inserta los productos iniciales usando la conexión nativa del proyecto.
 */
const seedData = async () => {
  try {
    // Sincroniza la tabla por si no se ha creado en PostgreSQL
    await sequelize.sync();
    console.log('🔄 Tabla de snacks verificada en PostgreSQL...');

    // Limpia registros previos para evitar duplicados en tus pruebas
    await Snack.destroy({ where: {} });

    // Inserción masiva de los combos y crispetas
    await Snack.bulkCreate([
      {
        name: 'Combo Mega Familiar',
        description: '1 Crispeta gigante, 4 Gaseosas medianas, 2 Perros calientes clásicos y 1 Chocolatina.',
        price: 45000.00,
        category: 'Combos',
        stock: 40,
        imageUrl: 'https://unsplash.com'
      },
      {
        name: 'Combo Pareja',
        description: '1 Crispeta grande de sal, 2 Gaseosas grandes y 1 M&Ms.',
        price: 32000.00,
        category: 'Combos',
        stock: 65,
        imageUrl: 'https://unsplash.com'
      },
      {
        name: 'Crispeta de Caramelo Grande',
        description: 'Crispeta grande explotada con nuestra receta especial de caramelo dulce artesanal.',
        price: 16500.00,
        category: 'Crispetas',
        stock: 120,
        imageUrl: 'https://unsplash.com'
      },
      {
        name: 'Crispeta de Sal Mediana',
        description: 'Crispeta clásica con el toque perfecto de sal y mantequilla derretida.',
        price: 12000.00,
        category: 'Crispetas',
        stock: 200,
        imageUrl: 'https://unsplash.com'
      },
      {
        name: 'Gaseosa Postobón Grande 32oz',
        description: 'Refrescante gaseosa helada a elección (Pepsi, Colombiana, Manzana o Seven Up).',
        price: 8500.00,
        category: 'Bebidas',
        stock: 350,
        imageUrl: 'https://unsplash.com'
      },
      {
        name: 'Perro Caliente Especial',
        description: 'Salchicha tipo americana, ripio de papa, salsas de la casa y queso derretido.',
        price: 14000.00,
        category: 'Comida Rápida',
        stock: 0, // En cero a propósito para probar tu regla de negocio RN-049
        imageUrl: 'https://unsplash.com'
      }
    ]);

    console.log('✅ ¡Confitería inyectada con éxito en tu base de datos!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inyectar los datos:', error);
    process.exit(1);
  }
};

seedData();
