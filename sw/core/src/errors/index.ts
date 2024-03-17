/**
 * @module errors
 *
 * This module contains custom error classes that are used throughout the application.
 */

/**
 * @brief Base class for all custom errors.
 */
export class TetError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TetError';
    }
}

/**
  * @brief Generic error class.
  *
  * This class is used for errors that don't fit into any other category.
  */
export class GenericError extends TetError {
    constructor(message: string) {
        super(message);
        this.name = 'GenericError';
    }
}

/**
 * @brief Error class for errors that occur during parsing of messages.
 * This should be used for errors caused by invalid message.
 */
export class ParsingError extends TetError {
    constructor(message: string) {
        super(message);
        this.name = 'ParsingError';
    }
}

/**
 * @brief Error class for errors caused by logic error inside the library.
 * User shouldn't see these.
 */
export class LogicError extends TetError {
    constructor(message: string) {
        super(message);
        this.name = 'LogicError';
    }
}

/**
 * @brief Error class for errors caused by user code in game environment.
 */
export class UserError extends TetError {
    constructor(message: string) {
        super(message);
        this.name = 'UserError';
    }
}

/**
 * @brief Error class for errors caused by calling a method that is not implemented.
 */
export class NotImplementedError extends GenericError {
    constructor(message: string) {
        super(message);
        this.name = 'NotImplementedError';
    }
}

/**
 * @brief Error class for errors caused by calling a library function with invalid argument.
 */
export class InvalidArgumentError extends GenericError {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidArgumentsError';
    }
}

/**
 * @brief Error class for errors caused by calling a library function with invalid state.
 */
export class InvalidStateError extends GenericError {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidStateError';
    }
}
