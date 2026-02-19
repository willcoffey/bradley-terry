// bradley-terry.ts
var MAX_ITERATIONS = 300;
var TOLERANCE = 1e-4;
var BradleyTerry = class _BradleyTerry {
  static compute(table) {
    assertValidWinsTable(table);
    let params = table[0].map(() => 1);
    let change = Infinity;
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      [params, change] = _BradleyTerry.computeNextIteration(params, table);
      if (change < TOLERANCE) break;
    }
    return params;
  }
  /**
   * Returns the result of applying formula 26 from the newman paper once.
   */
  static computeNextIteration(params, table) {
    const params_next = [];
    let change = 0;
    for (let i = 0; i < params.length; i++) {
      params_next[i] = _BradleyTerry.computeNextParam(i, params, table);
      change += Math.pow(params_next[i] - params[i], 2);
    }
    change = change / params.length;
    return [params_next, change];
  }
  /**
   * Executes the formula for a single parameter
   */
  static computeNextParam(i, params, table) {
    let numerator = 1 / (params[i] + 1);
    let denominator = 1 / (params[i] + 1);
    for (let j = 0; j < table.length; j++) {
      const i_j = table[i][j];
      const j_i = table[j][i];
      numerator += i_j * params[j] / (params[i] + params[j]);
      denominator += j_i / (params[i] + params[j]);
    }
    return numerator / denominator;
  }
};
function assertValidWinsTable(table) {
  if (!table.length) throw "No entries in wins table";
  for (const row of table) {
    if (row.length !== table.length) throw "Wins table is not N x N matrix";
  }
}

// gsheets-wrapper.ts
/*!
 * test
 */
function BRADLEYTERRY(data, labeled) {
  const { table, labels } = coerceToTable(data, labeled);
  const solution = BradleyTerry.compute(table).map((v, i) => {
    return [labels[i], v];
  });
  return solution;
}
function BRADLEYTERRY_TABLE(data, labeled) {
  const { table, labels } = coerceToTable(data, labeled);
  const rows = table.map((v, i) => {
    return [labels[i], ...v];
  });
  return [["", ...labels], ...rows];
}
/*!
 * Takes in custom formula arguments and convertes it to a standard format. Labels are either loaded
 * or generated. A list of pairings is converted to a wins table
 */
function coerceToTable(data, labeled) {
  const [rows, columns] = [data.length, data[0] ? data[0].length : 0];
  if (isNaN(data[0][1])) labeled = true;
  /*!
   * If the input data has the same number of rows and columns, interpret as a table of wins
   */
  if (rows === columns) {
    const labels = [];
    /*! If the input is square, assume table of wins */
    if (labeled) {
      /*! If labels exist, validate them and remove them from the data */
      if (rows < 2) throw "No data";
      const column_labels = data.shift().map((v) => `${v}`);
      column_labels.shift();
      for (const row of data) labels.push(`${row.shift()}`);
      /*! Validate labels are in sync */
      labels.map((v, i) => {
        if (v !== column_labels[i]) {
          throw `Row / Column label mismatch - ${v} !== ${column_labels[i]}`;
        }
      });
    } else {
      /*! Assume raw input of just wins. Create labels that are just 1,2,3,4 etc */
      for (let i = 0; i < data.length; i++) labels[i] = `Label ${i}`;
    }
    /*! Convert input data to table of numbers */
    const table = data.map((row) => {
      return row.map((value) => {
        const num = Number(value);
        if (Number.isNaN(num)) throw `Non numeric value in table (${num})`;
        return num;
      });
    });
    return { table, labels };
  } else if (columns === 2) {
    /*! Assume list of A vs B pairings where [A, B] means A beat B */
    return pairingsToTable(data);
  } else {
    throw "Input must either be a table of wins or a list of pairings. (either a square matrix or array of [ a, b ])";
  }
  return { table: [], labels: [] };
}
function pairingsToTable(pairings) {
  const wins = {};
  for (const [w, l] of pairings) {
    if (w === "" || l === "") continue;
    const winner = `${w}`;
    const loser = `${l}`;
    /*! Need to initialize both since graph may not be fully connected */
    wins[winner] = wins[winner] ?? {};
    wins[loser] = wins[loser] ?? {};
    wins[winner][loser] = wins[winner][loser] ?? 0;
    wins[loser][winner] = wins[loser][winner] ?? 0;
    /*! Record this win */
    wins[winner][loser]++;
  }
  /*! Convert the wins data structure to an array. */
  const labels = Object.keys(wins);
  const table = [];
  for (let i = 0; i < labels.length; i++) {
    const row = [];
    const winner = labels[i];
    for (let j = 0; j < labels.length; j++) {
      const loser = labels[j];
      row[j] = wins[winner][loser] ?? 0;
    }
    table.push(row);
  }
  return { table, labels };
}
