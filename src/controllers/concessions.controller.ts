import { Request, Response } from 'express';
import { MongoServerError, ObjectId } from 'mongodb';
import { matchedData } from 'express-validator';

import type { Concession } from '../models/concessions.model';
import type { CreateConcessionInput, UpdateConcessionInput } from '../dto/concessions.dto';

import { collections } from '../services/database.services';

export class ConcessionsController {
  getConcessions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { search } = matchedData(req, {
        locations: ['query']
      });
      const escapedSearch = search ? search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : undefined;
      const filter = escapedSearch
        ? {
            isActive: true,
            $or: [
              {
                name: {
                  $regex: escapedSearch,
                  $options: 'i'
                }
              },
              {
                description: {
                  $regex: escapedSearch,
                  $options: 'i'
                }
              }
            ]
          }
        : {
            isActive: true
          };
      const concessions = await collections.concessions.find(filter).sort({ name: 1 }).toArray();
      res.status(200).json(concessions);
    } catch (error) {
      console.error('Error getting concessions:', error);
      res.status(500).json({
        message: 'Error getting concessions'
      });
    }
  };

  getAllConcessions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { search } = matchedData(req, {
        locations: ['query']
      });
      let filter = {};
      if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchConditions: object[] = [
          {
            name: {
              $regex: escapedSearch,
              $options: 'i'
            }
          },
          {
            description: {
              $regex: escapedSearch,
              $options: 'i'
            }
          }
        ];
        if (ObjectId.isValid(search)) {
          searchConditions.push({
            _id: new ObjectId(search)
          });
        }
        filter = {
          $or: searchConditions
        };
      }
      const concessions = await collections.concessions.find(filter).sort({ name: 1 }).toArray();
      res.status(200).json(concessions);
    } catch (error) {
      console.error('Error getting all concessions:', error);
      res.status(500).json({
        message: 'Error getting all concessions'
      });
    }
  };

  getConcessionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { concessionId } = matchedData(req, {
        locations: ['params']
      });
      const concession = await collections.concessions.findOne({
        _id: new ObjectId(concessionId),
        isActive: true
      });
      if (!concession) {
        res.status(404).json({
          message: 'Concession not found'
        });
        return;
      }
      res.status(200).json(concession);
    } catch (error) {
      console.error('Error getting concession:', error);
      res.status(500).json({
        message: 'Error getting concession'
      });
    }
  };

  createConcession = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = matchedData(req, {
        locations: ['body']
      }) as CreateConcessionInput;
      const newConcession: Concession = {
        ...data
      };
      const result = await collections.concessions.insertOne(newConcession);
      res.status(201).json({
        message: 'Successfully created a new concession',
        concessionId: result.insertedId
      });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        res.status(409).json({
          message: 'A concession with this name already exists'
        });
        return;
      }
      console.error('Error creating concession', error);
      res.status(500).json({
        message: 'Unable to create concession'
      });
    }
  };

  updateConcessionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { concessionId } = matchedData(req, {
        locations: ['params']
      });
      const data = matchedData(req, {
        locations: ['body']
      }) as UpdateConcessionInput;
      if (Object.keys(data).length === 0) {
        res.status(400).json({
          message: 'No concession fields provided for update'
        });
        return;
      }
      const updatedConcession: Partial<Concession> = {
        ...data
      };
      const result = await collections.concessions.updateOne(
        {
          _id: new ObjectId(concessionId)
        },
        {
          $set: updatedConcession
        }
      );
      if (result.matchedCount === 0) {
        res.status(404).json({
          message: 'Concession not found'
        });
        return;
      }
      res.status(200).json({
        message: result.modifiedCount > 0 ? 'Successfully updated concession' : 'Concession is already up to date'
      });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        res.status(409).json({
          message: 'A concession with this name already exists'
        });
        return;
      }
      console.error('Error updating concession', error);
      res.status(500).json({
        message: 'Unable to update concession'
      });
    }
  };
}
