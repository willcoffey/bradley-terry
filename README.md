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

From formula 26 in the Newman paper

$`\pi'_i = \frac{1/(\pi_i + 1) + \sum_j w_{ij} \pi_j / (\pi_i + \pi_j)}{1/(\pi_i + 1) + \sum_j w_{ji} / (\pi_i + \pi_j)}`$

This is a modification to formula 12 which handles non-strongly connected graphs.

Quotes from paper section 5.

"the likelihood of a Bradley-Terry model in which we have added two fictitious games for each 
player, one won and one lost"

"It also removes the invariance under multiplication of the πi by a constant and hence eliminates 
the need to normalize them."

"This is the generalization of Eq. (12) to the MAP case. It is completely equivalent to adding the 
fictitious games and has the same guaranteed convergence."


[2]: https://arxiv.org/abs/2207.00076
[3]: https://www.jstor.org/stable/3448514
