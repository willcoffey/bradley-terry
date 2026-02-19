import { BradleyTerry } from "../bradley-terry";

/**
 * Generates a graph in mermaid syntax to be output to results.md
 *
 * Shows `error` on the Y axis and number of games on Y axis.
 *
 * Multiple lines, each representing a different tournament strategies
 */
interface Results {
  random: Record<string, number>;
}

interface TrialResults {
  matches: number;
  competitors: number;
  runs: number;
  strengthError: number;
  rankError: number;
}

function test() {
  runTrials();
  //generateGraph();
  /*
  const strengths = generatePlayerStrengths(10);
  const winsTable = playRandomMatches(strengths, 1001);
  const results = normalize(BradleyTerry.compute(winsTable));

  console.log(strengths);
  console.log(results);

  const error = computeSquaredError(strengths, results);
  console.log(error);
 */
}

function runTrials() {
  const settings = {
    competitors: 15,
    step: 6,
    number_of_datapoints: 20,
    runs: 20000,
  };
  const results: Record<string, Record<string, TrialResults>> = {};

  /**
   * Run loop for each datapoint to be generated, the number matches played
   */
  for (let i = 0; i < settings.number_of_datapoints; i++) {
    const matches = settings.step * i;
    const trial = runTrial(settings.competitors, matches, settings.runs, {
      random: playRandomMatches,
      roundrobin: playRoundRobin,
    });
    results[matches] = trial;
  }

  logGraph(results);
}

function logGraph(results: Record<string, Record<string, TrialResults>>) {
  const x_axis: string[] = [];
  const y_axis: number[][] = [];
  const rank_errors: number[][] = [];
  for (const [matches, trial] of Object.entries(results)) {
    x_axis.push(matches);
    let i = 0;
    for (const [name, res] of Object.entries(trial)) {
      y_axis[i] = y_axis[i] ? y_axis[i] : [];
      y_axis[i].push(res.strengthError);

      rank_errors[i] = rank_errors[i] ? rank_errors[i] : [];
      rank_errors[i].push(res.rankError);

      i++;
    }
  }
  const md = `
${"```"}mermaid
xychart-beta
    title "Error vs Trials"
    x-axis "Trials" ${x_axis[0]} --> ${x_axis[x_axis.length - 1]}
    line "Random" [${y_axis[0].map((n: number) => n.toFixed(4)).join(", ")}]
    line "Random" [${y_axis[1].map((n: number) => n.toFixed(4)).join(", ")}]
${"```"}`;
  console.log(md);

  console.log(`
${"```"}mermaid
xychart-beta
    title "Rank Error vs Matches"
    x-axis "Trials" ${x_axis[0]} --> ${x_axis[x_axis.length - 1]}
    line "Random" [${rank_errors[0].map((n: number) => n.toFixed(4)).join(", ")}]
    line "Random" [${rank_errors[1].map((n: number) => n.toFixed(4)).join(", ")}]
${"```"}`);
}

function runTrial(
  competitors: number,
  matches: number,
  runs: number,
  strategies: Record<string, Function>,
): Record<string, TrialResults> {
  const results: Record<string, TrialResults> = {};

  for (const [name, fn] of Object.entries(strategies)) {
    results[name] = {
      matches,
      competitors,
      runs,
      strengthError: 0,
      rankError: 0,
    };

    for (let i = 0; i < runs; i++) {
      const strengths = generatePlayerStrengths(competitors);
      const winsTable = fn(strengths, matches);
      const solution = normalize(BradleyTerry.compute(winsTable));
      results[name].strengthError += computeMeanError(strengths, solution);
      //results[name].rankError += computeRankError(strengths, solution);
      results[name].rankError += normalizedKendallTauDistance(strengths, solution);
    }

    results[name].strengthError = results[name].strengthError / runs;
    results[name].rankError = Math.sqrt(results[name].rankError / runs);
  }
  return results;
}

function generatePlayerStrengths(numPlayers: number): number[] {
  let sum = 0;
  const players: number[] = [];
  while (players.length < numPlayers) {
    const strength = Math.random();
    players.push(strength);
    sum += strength;
  }
  /**
   * Normalize the strengths such that the average strenght is 1
   */
  return players.map((s) => s / (sum / numPlayers));
}

/**
 * Simulates games according to player strenghts and creates a table of i vs j
 * wins. Players are selected randomly and `rounds` number of games are
 * simulated.
 */
function playRandomMatches(strengths: number[], rounds: number): number[][] {
  // Create a N x N matrix of 0s where table[i][j] represents wins of player
  // i vs player j
  const winsTable = strengths.map(() => strengths.map(() => 0));
  for (let round = 0; round < rounds; round++) {
    const i = Math.floor(Math.random() * strengths.length);
    const j = Math.floor(Math.random() * strengths.length);

    // Players cannot play against themselves
    if (i === j) {
      round--;
      continue;
    }

    // probability that i beats j
    const p = strengths[i] / (strengths[i] + strengths[j]);
    if (Math.random() < p) {
      winsTable[i][j] += 1;
    } else {
      winsTable[j][i] += 1;
    }
  }
  return winsTable;
}

function playRoundRobin(strengths: number[], rounds: number): number[][] {
  // Create a N x N matrix of 0s where table[i][j] represents wins of player
  // i vs player j
  const winsTable = strengths.map(() => strengths.map(() => 0));

  const matchTable: number[][] = [];

  for (let i = 0; i < strengths.length; i++) {
    for (let j = i + 1; j < strengths.length; j++) {
      matchTable.push([i, j]);
      /*
        const p = strengths[i] / (strengths[i] + strengths[j]);
        if (Math.random() < p) {
          winsTable[i][j] += 1;
        } else {
          winsTable[j][i] += 1;
        }
        */
      if (!rounds) break;
    }
    if (!rounds) break;
  }

  shuffle(matchTable);
  while (rounds) {
    for (const [i, j] of matchTable) {
      const p = strengths[i] / (strengths[i] + strengths[j]);
      if (Math.random() < p) {
        winsTable[i][j] += 1;
      } else {
        winsTable[j][i] += 1;
      }
      rounds--;
      if (!rounds) break;
    }
  }
  return winsTable;
}

/** Normalizes an array of strengths such that average of strengths === 1 */
function normalize(strengths: number[]): number[] {
  const sum = strengths.reduce((acc, s) => s + acc);
  const ratio = sum / strengths.length;
  return strengths.map((s) => s / ratio);
}
function computeSquaredError(a: number[], b: number[]): number {
  let err = 0;
  for (let i = 0; i < a.length; i++) {
    err += Math.pow(a[i] - b[i], 2);
  }
  return err / a.length;
}

function computeMeanError(a: number[], b: number[]): number {
  let err = 0;
  for (let i = 0; i < a.length; i++) {
    err += Math.abs(a[i] - b[i]);
  }
  return err / a.length;
}

function computeRankError(a: number[], b: number[]) {
  const ranked_a = a.map((v, i) => {
    return { value: v, index: i };
  }).sort((a, b) => b.value - a.value);

  const ranked_b = b.map((v, i) => {
    return { value: v, index: i };
  }).sort((a, b) => b.value - a.value);

  let error = 0;
  for (let i = 0; i < ranked_a.length; i++) {
    //error += Math.pow(ranked_a[i].index - ranked_b[i].index, 2);
    error += Math.abs(ranked_a[i].index - ranked_b[i].index);
  }
  error = error / ranked_a.length;
  return error;
}

function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Adapted from wikipedia page, not verified
 */
function normalizedKendallTauDistance(a: number[], b: number[]): number {
  /** Record index for each entry in the parrallel arrays, then sort by value */
  const ranked_a = a.map((v, i) => {
    return { value: v, index: i };
  }).sort((a, b) => b.value - a.value);

  const ranked_b = b.map((v, i) => {
    return { value: v, index: i };
  }).sort((a, b) => b.value - a.value);

  /** Create a simple array where elements are the original index position */
  a = ranked_a.map(({ index }) => index);
  b = ranked_b.map(({ index }) => index);

  let d = 0;
  for (let i = 1; i < a.length; i++) {
    for (let j = 0; j < i; j++) {
      d += Number((a[j] < a[i]) !== (b[j] < b[i]));
    }
  }
  return d / (.5 * a.length * (a.length - 1));
}

test();
