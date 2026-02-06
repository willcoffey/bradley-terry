import { BradleyTerry } from "../bradley-terry";

function test() {
  const strengths = generatePlayerStrengths(10);
  const winsTable = playRandomMatches(strengths, 92);
  const results = normalize(BradleyTerry.compute(winsTable));

  console.log(strengths);
  console.log(results);

  const error = computeSquaredError(strengths, results);
  console.log(error)
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
  return players.map((s) => {
    return s / (sum / numPlayers);
  });
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
  return err;
}

test();
