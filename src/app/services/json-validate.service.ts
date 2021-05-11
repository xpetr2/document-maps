import { Injectable } from '@angular/core';
import Ajv, {JSONSchemaType} from 'ajv';
import {Corpus} from '../utils/query.utils';

/**
 * The schema used to validate the parsed JSON
 */
// @ts-ignore
const searchQuerySchema: JSONSchemaType<Corpus> = {
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

/**
 * The validation service, validating a parsed JSON file
 */
@Injectable({
  providedIn: 'root'
})
export class JsonValidateService {
  /**
   * The validation function of a corpus
   * @param corpus  The corpus to be validated
   */
  validateCorpus(corpus: {}): boolean{
    const ajv = new Ajv();
    const validate = ajv.compile(searchQuerySchema);
    try{
      return validate(corpus);
    } catch (e) {
      return false;
    }
  }
}
