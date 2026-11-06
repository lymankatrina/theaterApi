import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { ObjectId } from 'mongodb';

import { collections } from '../services/database.services';

import type { CreateEventInput, UpdateEventInput } from '../dto/events.dto';
import type { Event } from '../models/events.model';

import { getTodayDateString } from '../helpers/helpers';

export class EventsController {
  getEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const { search, type, status } = matchedData(req, {
        locations: ['query']
      });
      const filter: Record<string, unknown> = {};
      if (type) {
        filter.type = type;
      }
      if (status) {
        filter.status = status;
      }
      if (search) {
        filter.$or = [
          {
            title: {
              $regex: search,
              $options: 'i'
            }
          },
          {
            tagline: {
              $regex: search,
              $options: 'i'
            }
          },
          {
            description: {
              $regex: search,
              $options: 'i'
            }
          }
        ];
      }
      const events = await collections.events.find(filter).sort({ startDate: 1 }).toArray();
      res.status(200).json(events);
    } catch (error) {
      console.error('Error getting events:', error);
      res.status(500).json({
        message: 'Error getting events'
      });
    }
  };

  getEventById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { eventId } = matchedData(req, {
        locations: ['params']
      });
      const event = await collections.events.findOne({
        _id: new ObjectId(eventId)
      });
      if (!event) {
        res.status(404).json({
          message: 'Event not found'
        });
        return;
      }
      res.status(200).json(event);
    } catch (error) {
      console.error('Error getting event by ID:', error);
      res.status(500).json({
        message: 'Error getting event by ID'
      });
    }
  };

  getCurrentEvents = async (_req: Request, res: Response): Promise<void> => {
    const today = getTodayDateString();
    try {
      const currentEvents = await collections.events
        .find({
          status: 'public',
          postStartDate: {
            $lte: today
          },
          postEndDate: {
            $gte: today
          }
        })
        .sort({
          startDate: 1
        })
        .toArray();
      res.status(200).json(currentEvents);
    } catch (error) {
      console.error('Error getting current events:', error);
      res.status(500).json({
        message: 'Error getting current events'
      });
    }
  };

  createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = matchedData(req, {
        locations: ['body']
      }) as CreateEventInput;
      const newEvent: Event = {
        ...data
      };
      const result = await collections.events.insertOne(newEvent);
      res.status(201).json({
        message: 'Successfully created a new event',
        eventId: result.insertedId
      });
    } catch (error) {
      console.error('Error creating event', error);
      res.status(500).json({
        message: 'Unable to create event'
      });
    }
  };

  updateEventById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { eventId } = matchedData(req, {
        locations: ['params']
      });
      const data = matchedData(req, {
        locations: ['body']
      }) as UpdateEventInput;
      if (Object.keys(data).length === 0) {
        res.status(400).json({
          message: 'No event fields provided for update'
        });
        return;
      }
      const existingEvent = await collections.events.findOne({
        _id: new ObjectId(eventId)
      });
      if (!existingEvent) {
        res.status(404).json({
          message: 'Event not found'
        });
        return;
      }
      const finalStartDate = data.startDate ?? existingEvent.startDate;
      const finalEndDate = data.endDate ?? existingEvent.endDate;
      const finalPostStartDate = data.postStartDate ?? existingEvent.postStartDate;
      const finalPostEndDate = data.postEndDate ?? existingEvent.postEndDate;
      if (finalEndDate < finalStartDate) {
        res.status(400).json({
          message: 'End date must be on or after start date'
        });
        return;
      }
      if (finalPostEndDate < finalPostStartDate) {
        res.status(400).json({
          message: 'Post end date must be on or after post start date'
        });
        return;
      }
      const updatedEvent: Partial<Event> = {
        ...data
      };
      const result = await collections.events.updateOne(
        {
          _id: new ObjectId(eventId)
        },
        {
          $set: updatedEvent
        }
      );
      if (result.matchedCount === 0) {
        res.status(404).json({
          message: 'Event not found'
        });
        return;
      }
      res.status(200).json({
        message: result.modifiedCount > 0 ? 'Successfully updated event' : 'Event is already up to date'
      });
    } catch (error) {
      console.error('Error updating event', error);
      res.status(500).json({
        message: 'Unable to update event'
      });
    }
  };

  deleteEventById = async (req: Request, res: Response): Promise<void> => {
    const { eventId } = matchedData(req, {
      locations: ['params']
    });
    try {
      const eventObjectId = new ObjectId(eventId);
      const result = await collections.events.deleteOne({
        _id: eventObjectId
      });
      if (result.deletedCount === 0) {
        res.status(404).json({
          message: 'Event not found.'
        });
        return;
      }
      res.status(200).json({
        message: 'Event successfully deleted.'
      });
    } catch (error) {
      console.error('Error deleting event', error);
      res.status(500).json({
        message: 'Unable to delete event.'
      });
    }
  };
}
