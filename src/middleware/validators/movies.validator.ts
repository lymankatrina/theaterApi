import {
  body,
  param
} from 'express-validator';

import {
  MOVIE_CERTIFICATIONS
} from '../../types/movies.types';

import {
  validDateString
} from '../../helpers/validationHelpers';

export const movieIdParamValidationRules = () => {
  return [
    param('movieId')
      .isMongoId()
      .withMessage('Movie ID must be a valid ObjectId')
  ];
};

const movieFieldValidationRules = (
  isUpdate = false
) => {
  const field = (name: string) => {
    const chain = body(name);
    return isUpdate 
      ? chain.optional() 
      : chain;
  };
  return [
    field('title')
      .isString()
      .withMessage('Movie title is required and must be a string')
      .trim()
      .isLength({ min: 1, max: 85 })
      .withMessage('Movie title must be between 1 and 85 characters'),
    field('tagLine')
      .isString()
      .withMessage('TagLine is required and must be a string')
      .trim()
      .isLength({ min: 1, max: 85 })
      .withMessage('Tagline must be between 1 and 85 characters'),
    field('overview')
      .isString()
      .withMessage('Overview is required and must be a string')
      .trim()
      .isLength({ min: 1, max: 850 })
      .withMessage('Overview must be between 1 and 850 characters'),
    field('year')
      .isInt({ min: 1888, max: 3000 })
      .withMessage('Movie year must be between 1888 and 3000')
      .toInt(),
    field('certification')
      .isString()
      .withMessage('Certification must be a string')
      .trim()
      .isIn([...MOVIE_CERTIFICATIONS])
      .withMessage('Certification must be a valid movie certification'),
    field('releaseDate')
      .isString()
      .withMessage('Release Date must be a string')
      .trim()
      .custom(validDateString),
    field('genres')
      .isString()
      .withMessage('Genres must be a string')
      .trim()
      .isLength({
        min: 2,
        max: 100
      })
      .withMessage('Genres must be between 2 and 100 characters')
      .matches(
        /^[A-Za-z]+(?: [A-Za-z]+)*(?:, [A-Za-z]+(?: [A-Za-z]+)*)*$/
      )
      .withMessage(
        'Genres must contain letters and be separated by commas'
      ),
    field('runtime')
      .isString()
      .withMessage('Runtime must be a string')
      .trim()
      .matches(/^[0-9]+h\s+[0-5]?[0-9]m$/)
      .withMessage('Runtime must be in the format 1h 55m'),
    body('imdbScore')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('IMDB Score must be a number between 0 and 10')
      .toFloat(),
    body('rottenTomatoes')
      .optional()
      .isString()
      .trim()
      .matches(/^(100|\d{1,2})%$/)
      .withMessage('Rotten Tomatoes must be between 0% and 100%'),
    body('fandangoAudienceScore')
      .optional()
      .isString()
      .trim()
      .matches(/^(100|\d{1,2})%$/)
      .withMessage('Fandango audience score must be between 0% and 100%'),
    field('poster')
      .isString()
      .trim()
      .isURL()
      .withMessage('Poster must be a URL to a publicly shared image'),
    field('trailer')
      .isString()
      .trim()
      .isURL()
      .withMessage('Trailer must be a URL to an official trailer')
  ];  
};

export const movieTitleParamValidationRules = () => {
  return [
    param('title')
      .isString()
      .withMessage('Movie title must be a string')
      .trim()
      .notEmpty()
      .withMessage('Movie title is required')
      .isLength({ max: 85 })
      .withMessage(
        'Movie title cannot exceed 85 characters'
      )
  ];
};

export const movieValidationRules = () => {
  return movieFieldValidationRules(false);
};

export const updateMovieValidationRules = () => {
  return movieFieldValidationRules(true);
};

