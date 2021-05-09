import { Injectable } from '@angular/core';
import Ajv, {JSONSchemaType} from 'ajv';
import {SearchQuery} from '../utils/query.utils';

// @ts-ignore
export const searchQuerySchema: JSONSchemaType<SearchQuery> = {
  type: 'object',
  properties: {
    dictionary: {
      type: 'object',
      patternProperties: {
        '^.+$': {
          type: 'string'
        }
      }
    },
    results: {
      type: 'object',
      patternProperties: {
        '^.+$': {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    },
    texts: {
      type: 'object',
      patternProperties: {
        '^.+$': {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    },
    texts_bow: {
      type: 'object',
      patternProperties: {
        '^.+$': {
          type: 'object',
          patternProperties: {
            '^.+$': {
              type: 'number'
            }
          }
        }
      }
    },
    version: {
      type: 'string'
    },
    word_similarities: {
      type: 'object',
      patternProperties: {
        '^.+$': {
          type: 'object',
          patternProperties: {
            '^.+$': {
              type: 'number'
            }
          }
        }
      }
    }
  },
  required: ['dictionary', 'results', 'texts', 'texts_bow', 'version', 'word_similarities'],
  additionalProperties: false
};

@Injectable({
  providedIn: 'root'
})
export class JsonValidateService {
  constructor() { }

  validateQuery(query: SearchQuery): boolean{
    const ajv = new Ajv();
    const validate = ajv.compile(searchQuerySchema);
    try{
      return validate(query);
    } catch (e) {
      return false;
    }
  }
}
