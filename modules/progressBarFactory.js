const log = require("electron-log");
const ProgressBar = require('electron-progressbar');


module.exports = {
    /**
     * @callback ProgressBarWork
     * @param {ProgressBar} progressBar
     * @returns {Promise<void>}
     */
    /**
     * @callback ProgressBarUpdateOnComplete
     * @param {ProgressBar} progressBar
     * @param {ResolveAction} resolve
     * @param {RejectAction} reject
     * @returns {Promise<void>}
     */
    /**
     * @callback ProgressBarUpdateOnProgress
     * @param {*} value
     * @param {ProgressBar} progressBar
     * @param {ResolveAction} resolve
     * @param {RejectAction} reject
     * @returns {Promise<void>}
     */
    /**
     * @callback ProgressBarUpdateOnAborted 
     * @param {*} value
     * @param {ProgressBar} progressBar
     * @param {ResolveAction} resolve
     * @param {RejectAction} reject
     * @returns {Promise<void>}
     */
    
    /**
     * creates determinate ProgressBar
     * 
     * closes ProgressBar once completed
     * 
     * wraps ProgressBar in Promise
     * 
     * Rejects Promise, if Progrssbar is aborted
     * 
     * completes ProgressBar once work-function finishes
     * 
     * @param {string} title 
     * @param {string} text 
     * @param {string} detail 
     * @param {number} maxValue 
     * @param {Object} loadingTextStyle 
     * @param {ProgressBarWork} work 
     * @param {*} rejectedValue 
     * @param {ProgressBarUpdateOnComplete} updateOnComplete 
     * @param {ProgressBarUpdateOnProgress} updateOnProgress 
     * @returns {Promise<T>}
     */
    ShowProgressBarAndRejectOnAbort(title, text, detail, maxValue, loadingTextStyle, work, rejectedValue, updateOnComplete, updateOnProgress){
        function rejectOnAbort(value, progressBar, resolve, reject)
        {
            reject(rejectedValue);
        }
        this.ShowProgressBar(title, text, detail, maxValue, loadingTextStyle, true, work, updateOnComplete, updateOnProgress, rejectOnAbort)
    },
    /**
     * creates indeterminate ProgressBar
     * 
     * closes ProgressBar once completed
     * 
     * wraps ProgressBar in Promise
     * 
     * completes ProgressBar once work-function finishes
     * 
     * @param {string} title 
     * @param {string} text 
     * @param {string} detail 
     * @param {Object} loadingTextStyle 
     * @param {ProgressBarWork} work 
     * @param {ProgressBarUpdateOnComplete} updateOnComplete 
     * @param {ProgressBarUpdateOnProgress} updateOnProgress 
     * @param {ProgressBarUpdateOnAborted} updateOnAborted 
     * @returns {Promise<T>}
     */
    ShowIndeterminateProgressBar(title, text, detail, loadingTextStyle, work, updateOnComplete, updateOnProgress, updateOnAborted){
        this.ShowProgressBar(title, text, detail, null, loadingTextStyle, true, work, updateOnComplete, updateOnProgress, updateOnAborted)
    },
    /**
     * wraps ProgressBar in Promise
     * 
     * completes ProgressBar once work-function finishes
     * 
     * @param {string} title 
     * @param {string} text 
     * @param {string} detail 
     * @param {number} maxValue 
     * @param {Object} loadingTextStyle 
     * @param {boolean} closeOnComplete 
     * @param {ProgressBarWork} work 
     * @param {ProgressBarUpdateOnComplete} updateOnComplete 
     * @param {ProgressBarUpdateOnProgress} updateOnProgress 
     * @param {ProgressBarUpdateOnAborted} updateOnAborted 
     * @returns {Promise<T>}
     */
    ShowProgressBar(title, text, detail, maxValue, loadingTextStyle, closeOnComplete, work, updateOnComplete, updateOnProgress, updateOnAborted){
        
        if (!updateOnComplete)
            updateOnComplete = () => {};        
        if (!updateOnProgress)
            updateOnProgress = () => {};        
        if (!updateOnAborted)
            updateOnAborted = () => {};

        return new Promise((resolve, reject) => {
            let progressBar = new ProgressBar({
                indeterminate: !maxValue,
                text: text,
                detail: detail,
                maxValue: maxValue,
                abortOnError: true,
                closeOnComplete: closeOnComplete,
                browserWindow: {
                    webPreferences: {
                        nodeIntegration: true
                    },
                    width: 550,
                    parent: global.mainWindow,
                    modal: true,
                    title: title,
                    backgroundColor: "#2b2826"
                },
                style: {
                    text: loadingTextStyle,
                    detail: loadingTextStyle,
                    value: loadingTextStyle
                }
            }, global.app);
    
            //Setup events to display data.
            progressBar
            .on('completed', function () {
                log.verbose(`ProgressBar completed`);
                updateOnComplete(progressBar, resolve, reject);
            })
            .on('aborted', function (value) {
                log.info(`ProgressBar aborted...`, value);
                updateOnAborted(value, progressBar, resolve, reject);
            })
            .on('progress', function(value) {
                log.verbose(`ProgressBar progress`, value);
                updateOnProgress(value, progressBar, resolve, reject);
            });

            return work(progressBar).then(() => {
                progressBar.setCompleted();
                resolve();
            });
        });
    }
}