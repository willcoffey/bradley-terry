# Bradley-Terry implementation

This is intended to be a simple implementation of the [Bradley-Terry][1] model. Code is written for
easy of readability and verifiability over performance.

[1]: https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model

# Sources
I am following the details from [Newman - Efficient computation of rankings from pairwise comparisons][2]
as I found it the most straightforward and readable method while still being efficient. Also worth 
noting is [MM algorithms for generalized Bradley-Terry models][3] which has a very similar method
that I assume converges faster. The current (Feb 2026) wikipedia page for Bradley-terry mixes
these two algorithms in the Inference/Worked example section leading to confusion.

From formula 12 in the Newman paper
$`\\pi'_i = \frac{\sum_j w_{ij} \pi_j / (\pi_i + \pi_j)}{\sum_j w_{ji} / (\pi_i + \pi_j)}`$


[2]: https://arxiv.org/abs/2207.00076
[3]: https://www.jstor.org/stable/3448514
