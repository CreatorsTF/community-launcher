
"use strict";

module.exports =
{
    /**
     * creates new Error containing a inner Error
     * @param {string} text 
     * @param {Error} innerError 
     */
    InnerError(text, innerError) {
        this.text = text;
        this.innerError = innerError;
    }
}