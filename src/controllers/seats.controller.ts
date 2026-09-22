import { Request, Response } from 'express';

import { collections } from '../services/database.services';

export class SeatsController {
  getSeats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const seats = await collections.seats
        .aggregate([
          {
            $addFields: {
              sectionOrder: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $eq: ['$section', 'left']
                      },
                      then: 1
                    },
                    {
                      case: {
                        $eq: ['$section', 'center']
                      },
                      then: 2
                    },
                    {
                      case: {
                        $eq: ['$section', 'right']
                      },
                      then: 3
                    }
                  ],
                  default: 4
                }
              }
            }
          },
          {
            $sort: {
              sectionOrder: 1,
              row: 1,
              seat: 1
            }
          },
          {
            $unset: 'sectionOrder'
          }
        ])
        .toArray();

      res.status(200).json(seats);
    } catch (error) {
      console.error('Error retrieving seats:', error);
      res.status(500).json({
        message: 'Unable to retrieve seats'
      });
    }
  };
}
