# Summary
 - Better build system for wrapper, preserving comments without `/*!`.
 - API docs for using as library
 - `TOLERANCE` and `MAX_ITERATIONS` as arguments

# To Read


# To Do
## Compare with voiting systems
[Voting with partial orders][1] looked like it should be a good place to start

[1]: https://scholarship.claremont.edu/cgi/viewcontent.cgi?article=1273&context=hmc_theses

## Review Tournament Design
[to read][2]
[2]: https://www.sciencedirect.com/science/article/pii/S0305054822001022

## Testing
 - Write tests that generate data and run the model against it.
 - Give some performance results
 - Find an external source of data to verify against

## API
 - Create an API class for processing input data into the format for the model

## Extension
 - Look at the method for extending the model to handle ties as described in the Newman paper
 - Look into how to get an estimation of uncertainty based on data size, matchups etc.

## Answer questions such as
 - Assume Eve knows the actual strength of players, the current scores, and can decide the next
matchup. How can we handle her favoring a single player by matching them against overrated players?
or other strategies?

- What other issues could arise from a malicious actor? Tournament design etc.

- What about malicious voters? If Eve can decide a single matchup, and knows the computed values as
well as actual strength how can she maximize the impact to favor her chosen player?
