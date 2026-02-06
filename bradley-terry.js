"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BradleyTerry = void 0;
var MAX_ITERATIONS = 100;
var BradleyTerry = /** @class */ (function () {
    function BradleyTerry() {
    }
    BradleyTerry.compute = function (table) {
        assertValidWinsTable(table);
        // Initialize an array of parametrs [1,1,1,1....] that is the same length
        // as the table of wins
        var params = table[0].map(function () { return 1; });
        for (var i = 0; i < MAX_ITERATIONS; i++) {
            params = BradleyTerry.computeNextIteration(params, table);
            /** @TODO - Do a convergence test and break early */
        }
        return params;
    };
    /**
     * Returns the result of applying formula 26 from the newman paper once.
     */
    BradleyTerry.computeNextIteration = function (params, table) {
        var params_next = [];
        for (var i = 0; i < params.length; i++) {
            params_next[i] = BradleyTerry.computeNextParam(i, params, table);
        }
        return params_next;
    };
    /**
     * Executes the formula for a single parameter
     */
    BradleyTerry.computeNextParam = function (i, params, table) {
        var numerator = 1 / (params[i] + 1);
        var denominator = 1 / (params[i] + 1);
        for (var j = 0; j < table.length; j++) {
            var i_j = table[i][j];
            var j_i = table[j][i];
            numerator += (i_j * params[j]) / (params[i] + params[j]);
            denominator += j_i / (params[i] + params[j]);
        }
        return numerator / denominator;
    };
    return BradleyTerry;
}());
exports.BradleyTerry = BradleyTerry;
/**
 * Verifies the wins table has entries and is N x N, i.e. square
 */
function assertValidWinsTable(table) {
    if (!table.length)
        throw "No entries in wins table";
    for (var _i = 0, table_1 = table; _i < table_1.length; _i++) {
        var row = table_1[_i];
        if (row.length !== table.length)
            throw "Wins table is not N x N matrix";
    }
}
BradleyTerry.compute([
    [0, 2, 0, 1],
    [3, 0, 5, 0],
    [0, 3, 0, 1],
    [4, 0, 3, 0],
]);
