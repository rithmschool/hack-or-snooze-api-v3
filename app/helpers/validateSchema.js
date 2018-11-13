const APIError = require('./APIError');

/**
 * Validate the thing POST and PATCH payloads against the appropriate schema definitions.
 * @param {Object} validation - schema validation object {the return value of v.validate(payload, schemaDefinition)}
 * @param {String} type - the thing being validated
 * @return {APIError} an APIError with a list of validation issues
 */
function validateSchema(validation, type) {
  let errors;

  if (!validation.valid) {
    errors = validation.errors.map(error => {
      switch (error.name) {
        case 'additionalProperties': {
          const immutableFields = {
            username: 1,
            favorites: 1,
            stories: 1
          };
          if (immutableFields[error.argument]) {
            return `The property '${
              error.argument
            }' is immutable at this endpoint`;
          }
          return `The property '${
            error.argument
          }' is not valid for ${type} objects`;
        }
        case 'pattern':
          return `The '${error.property
            .split('.')
            .pop()}' property only supports letters and numbers`;
        default:
          return error.stack
            .replace(/"/g, "'")
            .replace(
              'instance',
              `${type[0].toUpperCase() + type.slice(1)} object`
            );
      }
    });

    throw new APIError(400, 'Bad Request', `${errors.join('; ')}.`);
  }
}

module.exports = validateSchema;
