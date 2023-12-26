/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/search', 'N/file', './lib/csv'],
    
    (search, file, csv) => {

        const savedSearchId = 'customsearch_xxxxxxx';
        const csvFileName = 'SavedSearchExport.csv';
        const csvFolderId = 146875;

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            const savedSearchResults = getSavedSearchResults(loadSearch(savedSearchId));
            const savedSearchResultsStringified = csv.stringify(savedSearchResults.rows);

            const fileObj = file.create({
                name: csvFileName,
                fileType: file.Type.CSV,
                contents: '',
                folder: csvFolderId
            });

            savedSearchResultsStringified.split('\r\n').forEach(function (line) {
                fileObj.appendLine({
                    value: line
                });
            })

            fileObj.save();
        }

        const getSavedSearchResults = (savedSearch) => {
            const rows = [];
            const columns = [];

            savedSearch.columns.forEach(function (column) {
                columns.push(column.label);
            })

            rows.push(columns);

            savedSearch.rows.forEach(savedSearchResult => {
                const row = [];

                savedSearch.columns.forEach(function (column, index) {
                    row[index] = savedSearchResult.getValue({name: column});
                });

                rows.push(row);
            });

            return {rows: rows};
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
