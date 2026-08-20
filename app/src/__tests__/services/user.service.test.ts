// app/src/__tests__/services/user.service.test.ts

import userService from '../../services/user.service';
import { City, Department, Country, Profile } from '../../models';

jest.mock('../../models', () => {
  return {
    City: {
      findByPk: jest.fn(),
    },
    Department: {
      findByPk: jest.fn(),
    },
    Country: {
      findByPk: jest.fn(),
    },
    Profile: {
      findOne: jest.fn(),
    },
    User: {},
  };
});

describe('UserService · HU-002 Location Selection', () => {
  const validDto = {
    countryId: 1,
    departmentId: 10,
    cityId: 100,
    userId: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error if countryId is missing', async () => {
    await expect(userService.updateLocation({ ...validDto, countryId: 0 })).rejects.toThrow(
      'El país es obligatorio.',
    );
  });

  it('should throw error if departmentId is missing', async () => {
    await expect(userService.updateLocation({ ...validDto, departmentId: 0 })).rejects.toThrow(
      'El departamento es obligatorio.',
    );
  });

  it('should throw error if cityId is missing', async () => {
    await expect(userService.updateLocation({ ...validDto, cityId: 0 })).rejects.toThrow(
      'La ciudad es obligatoria.',
    );
  });

  it('should throw error if country does not exist', async () => {
    (Country.findByPk as jest.Mock).mockResolvedValue(null);

    await expect(userService.updateLocation(validDto)).rejects.toThrow(
      'El país seleccionado no existe.',
    );
  });

  it('should throw error if department does not exist', async () => {
    (Country.findByPk as jest.Mock).mockResolvedValue({ id: 1, name: 'Colombia' });
    (Department.findByPk as jest.Mock).mockResolvedValue(null);

    await expect(userService.updateLocation(validDto)).rejects.toThrow(
      'El departamento seleccionado no existe.',
    );
  });

  it('should throw error if department does not belong to country', async () => {
    (Country.findByPk as jest.Mock).mockResolvedValue({ id: 1, name: 'Colombia' });
    (Department.findByPk as jest.Mock).mockResolvedValue({
      id: 10,
      countryId: 999,
    });

    await expect(userService.updateLocation(validDto)).rejects.toThrow(
      'El departamento no pertenece al país seleccionado.',
    );
  });

  it('should throw error if city does not exist', async () => {
    (Country.findByPk as jest.Mock).mockResolvedValue({ id: 1, name: 'Colombia' });
    (Department.findByPk as jest.Mock).mockResolvedValue({
      id: 10,
      countryId: 1,
    });
    (City.findByPk as jest.Mock).mockResolvedValue(null);

    await expect(userService.updateLocation(validDto)).rejects.toThrow(
      'La ciudad seleccionada no existe.',
    );
  });

  it('should throw error if city is inactive', async () => {
    (Country.findByPk as jest.Mock).mockResolvedValue({ id: 1, name: 'Colombia' });
    (Department.findByPk as jest.Mock).mockResolvedValue({
      id: 10,
      countryId: 1,
    });
    (City.findByPk as jest.Mock).mockResolvedValue({
      id: 100,
      isActive: false,
      departmentId: 10,
    });

    await expect(userService.updateLocation(validDto)).rejects.toThrow(
      'La ciudad seleccionada no está activa.',
    );
  });

  it('should throw error if city does not belong to department', async () => {
    (Country.findByPk as jest.Mock).mockResolvedValue({ id: 1, name: 'Colombia' });
    (Department.findByPk as jest.Mock).mockResolvedValue({
      id: 10,
      countryId: 1,
    });
    (City.findByPk as jest.Mock).mockResolvedValue({
      id: 100,
      isActive: true,
      departmentId: 999,
    });

    await expect(userService.updateLocation(validDto)).rejects.toThrow(
      'La ciudad no pertenece al departamento seleccionado.',
    );
  });

  it('should successfully validate location and update profile if user exists', async () => {
    const mockProfileUpdate = jest.fn();
    (City.findByPk as jest.Mock).mockResolvedValue({
      id: 100,
      isActive: true,
      departmentId: 10,
    });
    (Department.findByPk as jest.Mock).mockResolvedValue({
      id: 10,
      countryId: 1,
    });
    (Country.findByPk as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Colombia',
    });
    (Profile.findOne as jest.Mock).mockResolvedValue({
      userId: 5,
      update: mockProfileUpdate,
    });

    await userService.updateLocation(validDto);

    expect(City.findByPk).toHaveBeenCalledWith(100);
    expect(Department.findByPk).toHaveBeenCalledWith(10);
    expect(Country.findByPk).toHaveBeenCalledWith(1);
    expect(Profile.findOne).toHaveBeenCalledWith({ where: { userId: 5 } });
    expect(mockProfileUpdate).toHaveBeenCalledWith({ cityId: 100 });
  });
});
