import type { Seat } from '../../models/seats.model';
import { collections } from '../database.services';

export const createSeats = (): Seat[] => {
  const seats: Seat[] = [];

  // Left section
  for (let row = 1; row <= 19; row++) {
    for (let seat = 1; seat <= 3; seat++) {
      seats.push({
        section: 'left',
        row,
        seat,
        isWheelchair: row === 5 && seat === 3
      });
    }
  }

  // Center section
  for (let row = 1; row <= 15; row++) {
    for (let seat = 1; seat <= 8; seat++) {
      seats.push({
        section: 'center',
        row,
        seat,
        isWheelchair: (row === 4 && seat === 8) || (row === 9 && seat === 1)
      });
    }
  }

  // Right section
  for (let row = 1; row <= 16; row++) {
    for (let seat = 1; seat <= 3; seat++) {
      seats.push({
        section: 'right',
        row,
        seat,
        isWheelchair: false
      });
    }
  }

  return seats;
};

export const seedSeats = async (): Promise<void> => {
  const existingSeats = await collections.seats.countDocuments();

  if (existingSeats > 0) {
    return;
  }

  const seats = createSeats();

  await collections.seats.insertMany(seats);
  console.log(`Created ${seats.length} seats`);
};
