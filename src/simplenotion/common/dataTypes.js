/* eslint-disable no-dupe-class-members */
/* eslint-disable camelcase */

/**
 * Notion data types configuration class
 *  - @param types in this class are native notion types.
 */
class dataTypes {
    /**
    * @constructor
     */
    constructor(...args) {
        this.annotations = {
            bold: true,
            italic: false,
            strikethrough: false,
            underline: true,
            code: false,
            color: 'default',
        };
    }

    /**
     * @param {string} fieldName - Name of a database field.
     * @param {string} content - Text data to be inserted in the Notion rich_text Object.
     * @return {rich_text} Notion rich_text Object.
     */
    SET_rich_text(fieldName, content) {
        const object = {
            [fieldName]: {
                rich_text: [
                    {
                        type: "text",
                        text: { content: content },
                        annotations: this.annotations,
                    },
                ],
            },
        };

        return object;
    }

    GET_rich_text(row) {

        const plainText = row.rich_text.reduce((accumulator, currentValue) => {
            return accumulator + currentValue.plain_text;
        }, '');

        return plainText;
    }


    /**
    * @param {string} fieldName - Name of a database field.
    * @param {string} content - Text data to be inserted in the Notion title Object.
    * @return {title} Notion title Object.
    */
    SET_title(fieldName, content) {
        const object = {
            [fieldName]: {
                title: [
                    {
                        text: { content: content },
                    },
                ],
            },
        };

        return object;
    }
    GET_title(notionNameObject) {

        const plainText = notionNameObject.title.reduce((accumulator, currentValue) => {
            return accumulator + currentValue.plain_text;
        }, '');

        return plainText;

    }

    /**
    * @param {string} fieldName - Name of a database field.
    * @param {string} content - Text data to be inserted in the Notion number Object.
    * @return {number} Notion number Object.
    */
    SET_number(fieldName, content) {
        const object = {
            [fieldName]: {
                number: Number(content),
            },
        };
        return object;
    }
    GET_number(notionNumberObject) {
        return notionNumberObject?.number || undefined
    }

    /**
    * @param {string} fieldName - Name of a database field.
    * @param {string} content - Text data to be inserted in the Notion date Object.
    * @return {date} Notion date Object.
    */
    SET_date(fieldName, content) {
        const object = {
            [fieldName]: {
                date: {
                    start: content,
                },
            },
        };
        return object;
    }
    GET_date(notionDateObject) {
        return notionDateObject?.date || undefined
    }
}



export default dataTypes;
