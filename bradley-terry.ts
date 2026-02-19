/**
 * A table of win/loss records for each id in the pairings
 *    A  B  C
 * A [0, 1, 2],
 * B [1, 0, 1],
 * C [2, 2, 0]
 *
 * so, [1][0] or Row B Column A represents the number of wins of B over A
 */
export type WinsTable = number[][];

const MAX_ITERATIONS = 300;
const TOLERANCE = .0001;

export class BradleyTerry {
  static compute(table: WinsTable): number[] {
    assertValidWinsTable(table);
    // Initialize an array of parametrs [1,1,1,1....] that is the same length
    // as the table of wins
    let params = table[0].map(() => 1);
    let change = Infinity;
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      [params, change] = BradleyTerry.computeNextIteration(params, table);
      if (change < TOLERANCE) break;
    }
    return params;
  }

  /**
   * Returns the result of applying formula 26 from the newman paper once.
   */
  static computeNextIteration(params: number[], table: WinsTable): [number[], number] {
    const params_next = [];
    let change = 0;
    for (let i = 0; i < params.length; i++) {
      params_next[i] = BradleyTerry.computeNextParam(i, params, table);
      change += Math.pow(params_next[i] - params[i], 2);
    }
    change = change / params.length;
    return [params_next, change];
  }

  /**
   * Executes the formula for a single parameter
   */
  static computeNextParam(i: number, params: number[], table: WinsTable): number {
    let numerator = 1 / (params[i] + 1);
    let denominator = 1 / (params[i] + 1);

    for (let j = 0; j < table.length; j++) {
      const i_j = table[i][j];
      const j_i = table[j][i];
      numerator += (i_j * params[j]) / (params[i] + params[j]);
      denominator += j_i / (params[i] + params[j]);
    }
    return numerator / denominator;
  }
}

/**
 * Verifies the wins table has entries and is N x N, i.e. square
 */
function assertValidWinsTable(table: WinsTable) {
  if (!table.length) throw "No entries in wins table";
  for (const row of table) {
    if (row.length !== table.length) throw "Wins table is not N x N matrix";
  }
}
