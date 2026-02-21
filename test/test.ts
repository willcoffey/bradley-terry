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

interface Trial {
  parameters: {
    competitors: number;
    matches: number;
    runs: number;
  };
  results: {
    strengthError: number;
    rankError: number;
    oddsCorrectWinner: number;
  };
}

interface Settings {
  competitors: number;
  step: number;
  number_of_datapoints: number;
  runs: number;
}

function test() {
  runTrials();
}

/**
 * Runs a grid of trials over increasing match counts and logs mermaid charts
 *
 * Settings:
 *   - competitors: number of players in each simulated tournament
 *   - step: number of additional matches between each datapoint
 *   - number_of_datapoints: how many points on the x-axis
 *   - runs: how many independent simulations are averaged per datapoint
 *     (higher = smoother curves, slower runtime)
 *
 * Each datapoint plays `step * i` total matches (starting at 0), runs the
 * BradleyTerry solver, and records mean strength error and Kendall tau rank
 * error averaged across all runs.
 */
function runTrials() {
  const settings: Settings = {
    competitors: 12,
    step: 100,
    number_of_datapoints: 100,
    runs: 50,
  };
  const results: Record<string, Record<string, Trial>> = {};

  // Each iteration represents one x-axis datapoint: matches = step * i
  for (let i = 0; i < settings.number_of_datapoints; i++) {
    const matches = settings.step * i;
    // Compare random matchmaking vs round-robin ordering at this match count
    const trial = runTrial(settings.competitors, matches, settings.runs, {
      random: playRandomMatches,
      roundrobin: playRoundRobin,
    });
    results[matches] = trial;
  }

  logGraph(results, settings);
}

function logGraph(results: Record<string, Record<string, Trial>>, settings: Settings) {
  const x_axis: string[] = [];
  const y_axis: number[][] = [];
  const rank_errors: number[][] = [];
  const correct_winner: number[][] = [];
  /**
   * Results is a record of # of matches to a record of test name (roundrobin, oddsCorrectWinner) 
   * to trial results. I.e. for each step of # of matches there exist trial results for each 
   * property that is being tested
   */
  for (const [matches, trial] of Object.entries(results)) {
    x_axis.push(matches);
    let i = 0;
    for (const [name, res] of Object.entries(trial)) {
      y_axis[i] = y_axis[i] ? y_axis[i] : [];
      y_axis[i].push(res.results.strengthError);

      rank_errors[i] = rank_errors[i] ? rank_errors[i] : [];
      rank_errors[i].push(res.results.rankError);

      correct_winner[i] = correct_winner[i] ? correct_winner[i] : [];
      correct_winner[i].push(res.results.oddsCorrectWinner);

      i++;
    }
  }
  const md = `
${"```"}mermaid
xychart-beta
    title "Mean Strength Error vs Matches for ${settings.competitors} competitors"
    x-axis "Trials" ${x_axis[0]} --> ${x_axis[x_axis.length - 1]}
    line "Random" [${y_axis[0].map((n: number) => n.toFixed(4)).join(", ")}]
    line "Random" [${y_axis[1].map((n: number) => n.toFixed(4)).join(", ")}]
${"```"}`;
  console.log(md);

  console.log(`
${"```"}mermaid
xychart-beta
    title "Kendall Tau Rank Error vs Matches for ${settings.competitors} competitors"
    x-axis "Trials" ${x_axis[0]} --> ${x_axis[x_axis.length - 1]}
    line "Random" [${rank_errors[0].map((n: number) => n.toFixed(4)).join(", ")}]
    line "Random" [${rank_errors[1].map((n: number) => n.toFixed(4)).join(", ")}]
${"```"}`);

  console.log(`
${"```"}mermaid
xychart-beta
    title "Odds Correct Winner vs Matches for ${settings.competitors} competitors"
    x-axis "Trials" ${x_axis[0]} --> ${x_axis[x_axis.length - 1]}
    line "Random" [${correct_winner[0].map((n: number) => n.toFixed(4)).join(", ")}]
    line "Round Robin" [${correct_winner[1].map((n: number) => n.toFixed(4)).join(", ")}]
${"```"}`);
}

function runTrial(
  competitors: number,
  matches: number,
  runs: number,
  strategies: Record<string, Function>,
): Record<string, Trial> {
  const results: Record<string, Trial> = {};

  for (const [name, fn] of Object.entries(strategies)) {
    results[name] = {
      parameters: { competitors, matches, runs },
      results: { strengthError: 0, rankError: 0, oddsCorrectWinner: 0 },
    };

    for (let i = 0; i < runs; i++) {
      const strengths = generatePlayerStrengths(competitors);
      const winsTable = fn(strengths, matches);
      const solution = normalize(BradleyTerry.compute(winsTable));
      results[name].results.strengthError += computeMeanError(strengths, solution);
      results[name].results.rankError += normalizedKendallTauDistance(strengths, solution);
      const trueWinner = strengths.indexOf(Math.max(...strengths));
      const predictedWinner = solution.indexOf(Math.max(...solution));
      if (trueWinner === predictedWinner) results[name].results.oddsCorrectWinner++;
    }

    results[name].results.strengthError /= runs;
    results[name].results.rankError = Math.sqrt(results[name].results.rankError / runs);
    results[name].results.oddsCorrectWinner /= runs;
  }
  return results;
}

function generatePlayerStrengths(numPlayers: number): number[] {
  let sum = 0;
  const players: number[] = [];
  while (players.length < numPlayers) {
    const strength = normalRandom();
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

/** From
 * https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
 *
 * Normal Distribution Between 0 and 1
 * Building on Maxwell's Answer, this code uses the Box–Muller transform to give you a normal
 * distribution between 0 and 1 inclusive. It just resamples the values if it's more than 3.6
 * standard deviations away (less than 0.02% chance)
 *
 * joshuakcockrell
 */
function normalRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return normalRandom(); // resample between 0 and 1
  return num;
}

test();
