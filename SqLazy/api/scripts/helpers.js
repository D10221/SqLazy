/// <reference path='../../typings/tsd.d.ts' />
/// <reference path='../apiConfig.ts' />
var _ = require('underscore');
var apiConfig = require('../apiConfig');
function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

/*zeroPad(5, 2); // "05"
zeroPad(5, 4); // "0005"
zeroPad(5, 6); // "000005"
zeroPad(1234, 2); // "1234" :)*/
function getPattern(request) {
    var year = request.params && request.params.year ? request.params.year : null;
    var month = request.params && request.params.month ? request.params.month : null;
    var pattern = apiConfig.base + '@year-@month/*.sql';
    if (year) {
        pattern = pattern.replace(/@year/g, year || '*');
        pattern = pattern.replace(/@month/g, getMonth(month) || '*');
    } else {
        pattern = pattern.replace(/@year-@month/g, '**');
    }

    console.info("Looking for files wirh Pattern: " + pattern);
    return pattern;
}

function getMonth(month) {
    var months = ["*", "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "novenber", "december"];

    if (!month || typeof month != 'string' || month === '*') {
        return month;
    }
    var m = parseInt(month);
    var isNum = _.isNumber(m) && !_.isNaN(m);

    var xxx = function () {
        var index = _.indexOf(months, month.toLowerCase());
        return index ? (zeroPad(index, 2) + "-" + months[index]) : month;
    };

    var found = isNum ? (month + "-" + months[m]) : xxx();
    console.info('Found Month: ' + found);
    return found || month;
}

function Resolve(deferred, error, data) {
    if (error) {
        deferred.reject(error);
        return;
    }
    console.log('Resolved');
    deferred.resolve(data);
}

module.exports = {
    getPattern: getPattern,
    getMonth: getMonth,
    Resolve: Resolve
};
//# sourceMappingURL=helpers.js.map
