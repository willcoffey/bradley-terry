import { BradleyTerry, WinsTable } from "./bradley-terry";

type Pairings = any;
type LabeledWinsTable = any;

type HeaderRow = string[];
type SheetsRow = [string, ...number[]];
type SheetsTable = [HeaderRow, ...SheetsRow[]];
/*!
/**
 * Computes Bradley-Terry model scores for a set of competitors.
 *
 * Accepts a square wins table (entry [i][j] = wins of i over j) or an Nx2 list of
 * [winner, loser] pairings. Pass FALSE as the second argument if the wins table has no labels.
 *
 * @param {Array[][]} data - Square wins table or Nx2 [winner, loser] pairings.
 * @param {boolean} labeled - Whether the wins table has row/column labels. Default: TRUE.
 * @return {Array[][]} Two-column array of [label, score] pairs.
 * @customfunction
 */
function BRADLEYTERRY(data: WinsTable | Pairings | LabeledWinsTable, labeled?: boolean = true) {
  const { table, labels } = coerceToTable(data, labeled);
  const solution = BradleyTerry.compute(table).map((v, i) => {
    return [labels[i], v];
  });
  return solution;
}

/*!
/**
 * Returns a labeled wins table from pairings or an existing wins table.
 *
 * Useful for inspecting the data passed to BRADLEYTERRY. Accepts the same input formats.
 * Pass FALSE as the second argument if the wins table has no labels.
 *
 * @param {Array[][]} data - Square wins table or Nx2 [winner, loser] pairings.
 * @param {boolean} labeled - Whether the wins table has row/column labels. Default: TRUE.
 * @return {Array[][]} Labeled wins table with row and column headers.
 * @customfunction
 */
function BRADLEYTERRY_TABLE(
  data: WinsTable | Pairings | LabeledWinsTable,
  labeled?: boolean = true,
) {
  const { table, labels } = coerceToTable(data, labeled);
  const rows: SheetsRow[] = table.map((v, i) => {
    return [labels[i], ...v];
  });
  return [["", ...labels], ...rows];
}

/*!
 * Normalizes formula input to a wins table and labels. Handles labeled/unlabeled tables and pairings.
 */
function coerceToTable(
  data: (string | number)[][],
  labeled: boolean,
): { table: WinsTable; labels: string[] } {
  const [rows, columns] = [data.length, data[0] ? data[0].length : 0];

  /*!
   * If the input data has the same number of rows and columns, interpret as a table of wins
   */
  if (rows === columns) {
    const labels = [];
    /*! If the input is square, assume table of wins */
    if (labeled) {
      /*! If labels exist, validate them and remove them from the data */
      if (rows < 2) throw "No data";
      const column_labels = data.shift()!.map((v) => `${v}`);
      // Remove the cell that is the column header for the labels column
      column_labels.shift();

      for (const row of data) labels.push(`${row.shift()}`);
      /*! Validate labels are in sync */
      labels.map((v, i) => {
        if (v !== column_labels![i]) {
          throw `Row / Column label mismatch - ${v} !== ${column_labels![i]}`;
        }
      });
    } else {
      /*! Assume raw input of just wins. Create labels that are just 1,2,3,4 etc */
      for (let i = 0; i < data.length; i++) labels[i] = `Label ${i}`;
    }

    /*! Convert input data to table of numbers */
    const table: number[][] = data.map((row) => {
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

interface WinsObject {
  [competitor: string]: Record<string, number>;
}

function pairingsToTable(pairings: (string | number)[][]): { table: WinsTable; labels: string[] } {
  const wins: WinsObject = {};

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
  const table: number[][] = [];
  for (let i = 0; i < labels.length; i++) {
    const row: number[] = [];
    const winner = labels[i];
    for (let j = 0; j < labels.length; j++) {
      const loser = labels[j];
      row[j] = wins[winner][loser] ?? 0;
    }
    table.push(row);
  }
  return { table, labels };
}
