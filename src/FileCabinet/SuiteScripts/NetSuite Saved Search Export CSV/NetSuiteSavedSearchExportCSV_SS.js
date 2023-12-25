/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/search', 'N/file'],
    
    (search, file) => {

        const savedSearchId = 'customsearch_de_taf_ap_b6';
        const csvFileName = 'SavedSearchExport.csv';
        const csvFolderId = 146875;
        const csvNewLine = '\r\n'
        const csvDelimiter = ',';

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            const savedSearchResults = getSavedSearchResults(loadSearch(savedSearchId));

            const fileObj = file.create({
                name: csvFileName,
                fileType: file.Type.CSV,
                contents: savedSearchResults.columns.join(csvDelimiter) + csvNewLine,
                folder: csvFolderId
            });

            savedSearchResults.rows.forEach(function (line) {
                fileObj.appendLine({
                    value: line.join(csvDelimiter) + csvNewLine
                });
            })

            fileObj.save();
        }

        const getSavedSearchResults = (savedSearch) => {
            const rows = [];

            savedSearch.rows.forEach(savedSearchResult => {
                let row = [];

                savedSearch.columns.forEach(column, index => {
                    row[index] = savedSearchResult.getValue({name: column})
                });

                rows.push(row)
            });

            return {rows: rows, columns: savedSearch.columns};
        }

        const loadSearch = (searchId) => {
            const savedSearch = search.load({
                id : searchId,
            });

            let result = [];
            let count = 0;
            const pageSize = 1000;
            let start = 0;

            do {
                const resultSet = savedSearch.run().getRange({
                    start : start,
                    end : start + pageSize
                });

                result = result.concat(resultSet);
                count = resultSet.length;
                start += pageSize;

            } while (count === pageSize);

            return { columns: savedSearch.columns, rows: result};
        }

        return {execute}

    });
