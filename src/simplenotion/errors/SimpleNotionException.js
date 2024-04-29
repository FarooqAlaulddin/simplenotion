// eslint-disable-next-line no-unused-vars
import errorCodes from '+sn/errors/ErrorCodes.json';
import { config } from '+sn/conf';

/**
 * Error class used to handle native sdk and simplenotion exceptions.
 */
export class SimpleNotionException extends Error {
    /**
     * Error class used to handle notionhq native sdk and simplenotion exceptions.
     * @constructor
     * @param {number} code - Error code identifier.
     * @param {*} message - custom message.
    */
    constructor(code = 1, message = '') {
        super(message);
        this.code = code;
        this.type = this.getErrorType(this.code).text;
        return this.info();
    }

    /**
     * Method used to display and return the exception.
     * @return {JSON} - Error {code: string, text: string, message: string}
     */
    info() {

        const regex = /`"|"`/gm;
        const subst = ``;
        this.message = this.message.replace(regex, subst);

        // console.log(`{"code": ${this.code}, "text": "${this.type}", "message": "${this.message === '' ? '' : this.message}"}`.brightBlue);
        this.display = {
            code: this.code,
            text: this.type,
            msg: this.message,
        }

        return this.display;
    }


    /**
     * Method to retrieve the error type from ./ErrorCodes.json
     * @param {number} code - Error code identifier.
     * @return {JSON} ErrorType
     */
    getErrorType(code) {
        return errorCodes.find((error) => error.code === code);
    }
}


/**
 * Convert SimpleNotionException message/arg[1] from notion-client-error-type => string: body.message
 */
function ExceptionMessageHandler(notionError) {

    // args[1] is message, so we are checking if message is string or object
    // if object, we expect this object to be notion client error type. we will try to get some information from it
    let message = ''

    if (notionError === 'object') {
        try {
            let message = JSON.parse(notionError.body).message
            message = message.replace(/\n/g, " ==> ")
        } catch (error) {
            // pass
        }
    }

    return message
}