// app/src/seed-snacks.ts

import { Snack } from './models/snack.model';
import { Promotion } from './models/promotion.model';
import sequelize from './config/database';

/**
 * Script de inyección manual de datos para Confitería
 * --------------------------------------------------
 * Inserta los productos iniciales usando la conexión nativa del proyecto.
 * Incluye descuentos base por producto y promociones temporales de ejemplo (HU-012).
 */
const seedData = async () => {
  try {
    // Sincroniza la tabla por si no se ha creado en PostgreSQL
    await sequelize.sync();
    console.log('🔄 Tabla de snacks y promociones verificadas en PostgreSQL...');

    // Limpia registros previos para evitar duplicados en tus pruebas
    await Snack.destroy({ where: {} });
    await Promotion.destroy({ where: {} });

    // Inserción masiva de los combos y crispetas
    const snacks = await Snack.bulkCreate([
      {
        name: 'Combo Mega Familiar',
        description: '1 Crispeta gigante, 4 Gaseosas medianas, 2 Perros calientes clásicos y 1 Chocolatina.',
        price: 45000.00,
        category: 'Combos',
        stock: 40,
        imageUrl: 'https://unsplash.com',
        discountPercentage: 10.00
      },
      {
        name: 'Combo Pareja',
        description: '1 Crispeta grande de sal, 2 Gaseosas grandes y 1 M&Ms.',
        price: 32000.00,
        category: 'Combos',
        stock: 65,
        imageUrl: 'https://unsplash.com',
        discountPercentage: 5.00
      },
      {
        name: 'Crispeta de Caramelo Grande',
        description: 'Crispeta grande explotada con nuestra receta especial de caramelo dulce artesanal.',
        price: 16500.00,
        category: 'Crispetas',
        stock: 120,
        imageUrl: 'https://unsplash.com',
        discountPercentage: 0
      },
      {
        name: 'Crispeta de Sal Mediana',
        description: 'Crispeta clásica con el toque perfecto de sal y mantequilla derretida.',
        price: 12000.00,
        category: 'Crispetas',
        stock: 200,
        imageUrl: 'https://unsplash.com',
        discountPercentage: 0
      },
      {
        name: 'Gaseosa Postobón Grande 32oz',
        description: 'Refrescante gaseosa helada a elección (Pepsi, Colombiana, Manzana o Seven Up).',
        price: 8500.00,
        category: 'Bebidas',
        stock: 350,
        imageUrl: 'https://unsplash.com',
        discountPercentage: 0
      },
      {
        name: 'Perro Caliente Especial',
        description: 'Salchicha tipo americana, ripio de papa, salsas de la casa y queso derretido.',
        price: 14000.00,
        category: 'Comida Rápida',
        stock: 0, // En cero a propósito para probar tu regla de negocio RN-049
        imageUrl: 'https://unsplash.com',
        discountPercentage: 0
      }
    ]);

    // Promociones temporales de ejemplo (TASK 7)
    const now = new Date();
    const inDays = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    await Promotion.bulkCreate([
      {
        snackId: snacks[2].id, // Crispeta de Caramelo Grande
        name: 'Promoción 2x1 en Crispetas de Caramelo',
        discountType: 'percent',
        discountValue: 50.00,
        startDate: inDays(-5),
        endDate: inDays(10),
        isActive: true
      },
      {
        snackId: snacks[4].id, // Gaseosa Postobón Grande
        name: 'Rebaja fin de semana en gaseosas',
        discountType: 'fixed',
        discountValue: 1000.00,
        startDate: inDays(-2),
        endDate: inDays(5),
        isActive: true
      },
      {
        snackId: snacks[1].id, // Combo Pareja
        name: 'Promoción expirada',
        discountType: 'percent',
        discountValue: 20.00,
        startDate: inDays(-30),
        endDate: inDays(-15),
        isActive: true // Expirada por fecha: no debe aplicarse
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
