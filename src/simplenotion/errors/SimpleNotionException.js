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
    constructor(...args) {

        let code = undefined // if code < 1000, means request is sent to notion
        let text = undefined // text version of the code.
        let message = undefined // any details?
        let more = undefined  // anything else passed as object {field: value}

        if (args.length === 1 && typeof args[0] === 'object') {
            const notionError = args[0]
            code = notionError.status;
            text = notionError.code;
            message = notionError.message;
        }
        else {
            [code = 1, message = '', ...more] = args
        }

        const ErrorJsonObject = getErrorByCode(code);

        message = `${ErrorJsonObject?.description ? ErrorJsonObject.description : ''}${message ? ' ' + message : ''}`

        super(message);
        this.code = code;
        this.text = text ? text : ErrorJsonObject.code_text;
        this.description = this.message

        return this.info(more);
    }

    /**
     * Method used to display and return the exception.
     * @return {JSON} - Error {code: string, text: string, message: string}
     */
    info(more) {

        const regex = /`"|"`/gm;
        const subst = ``;
        // this.message = this.message.replace(regex, subst);

        // console.log(`{"code": ${this.code}, "text": "${this.type}", "message": "${this.message === '' ? '' : this.message}"}`.brightBlue);
        const display = {
            code: this.code,
            text: this.text,
            description: this.description,
        }

        more && more.forEach(arg => {
            if (typeof arg === 'object') {
                Object.assign(display, arg)
            }
        })

        return display;
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


function getErrorByCode(code) {
    return errorCodes.find((error) => error.code === code);
}