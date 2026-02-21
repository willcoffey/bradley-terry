<script src ="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs" type="module"></script>
# Bradley-Terry implementation

This is intended to be a simple implementation of the [Bradley-Terry][1] model. Code is written for
easy of readability and verifiability over performance.

Note that this has not been thoroughly tested.

[1]: https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model

# Usage
`gsheet-wrapper.ts` is a wrapper function around the library that allows for usage as a Google
Apps Script extension providing the custom formula `BRADLEYTERRY` for usage inside a google
sheet. 

The file is bundled using `esbuild` to `dist/gsheet-wrapper.js`. Simply copy the contents of this
file to Apps Script (Extensions -> Apps Script) to make it available. Then you be able to use the
spreadsheet function  with a table of wins, or a list of pairings. E.g.

|   | A | B |
|---|---|---|
| **1** | Nora | Tollhouse |
| **2** | Tollhouse | Saffitz |
| **3** | Saffitz | Pillsbury |
| **4** | Tollhouse | Pillsbury |
| **5** | Nora | Pillsbury |
| **6** | Nora | Saffitz |
| **7** | Saffitz | Tollhouse |
| **8** | Tollhouse | Saffitz |
`=BRADLEYTERRY(A:B)`

or a table of wins

|   | A | B | C | D | E |
|---|---|---|---|---|---|
| **1** | | Nora | Tollhouse | Saffitz | Pillsbury |
| **2** | Nora | 0 | 1 | 1 | 1 |
| **3** | Tollhouse | 0 | 0 | 2 | 1 |
| **4** | Saffitz | 0 | 1 | 0 | 1 |
| **5** | Pillsbury | 0 | 0 | 0 | 0 |
`=BRADLEYTERRY(A1:E5)`

@TODO - For example usage see [this google sheet][1]

[1]: https://example.com


# Sources
I am following the details from [Newman - Efficient computation of rankings from pairwise comparisons][2]
as I found it the most straightforward and readable method while still being efficient. Also worth 
noting is [MM algorithms for generalized Bradley-Terry models][3] which has a very similar method
that I assume converges faster. The current (Feb 2026) wikipedia page for Bradley-terry mixes
these two algorithms in the Inference/Worked example section leading to confusion. The example table
is also not a strongly connected graph, and this fact is not accounted for leading to erroneous
results.

From formula 26 in the Newman paper

$`\pi'_i = \frac{1/(\pi_i + 1) + \sum_j w_{ij} \pi_j / (\pi_i + \pi_j)}{1/(\pi_i + 1) + \sum_j w_{ji} / (\pi_i + \pi_j)}`$

This is a modification to formula 12 which handles non-strongly connected graphs.

Quotes from paper section 5.

> ...the likelihood of a Bradley-Terry model in which we have added two fictitious games for each 
> player, one won and one lost
> 
> It also removes the invariance under multiplication of the πi by a constant and hence eliminates 
> the need to normalize them.
> 
> This is the generalization of Eq. (12) to the MAP case. It is completely equivalent to adding the 
> fictitious games and has the same guaranteed convergence.


[2]: https://arxiv.org/abs/2207.00076
[3]: https://www.jstor.org/stable/3448514

# Simulation Results
<!-- results -->

```mermaid
xychart-beta
    title "Mean Strength Error vs Matches for 12 competitors"
    x-axis "Trials" 0 --> 9900
    line "Random" [0.1537, 0.3580, 0.2552, 0.2094, 0.1809, 0.1625, 0.1481, 0.1375, 0.1287, 0.1207, 0.1144, 0.1085, 0.1046, 0.1001, 0.0974, 0.0935, 0.0906, 0.0880, 0.0854, 0.0829, 0.0809, 0.0787, 0.0773, 0.0754, 0.0742, 0.0722, 0.0712, 0.0699, 0.0687, 0.0669, 0.0660, 0.0649, 0.0642, 0.0632, 0.0617, 0.0613, 0.0608, 0.0594, 0.0587, 0.0580, 0.0573, 0.0564, 0.0557, 0.0551, 0.0547, 0.0540, 0.0530, 0.0528, 0.0519, 0.0516, 0.0511, 0.0506, 0.0499, 0.0498, 0.0490, 0.0491, 0.0483, 0.0478, 0.0475, 0.0469, 0.0464, 0.0464, 0.0460, 0.0453, 0.0453, 0.0449, 0.0444, 0.0443, 0.0438, 0.0436, 0.0433, 0.0426, 0.0425, 0.0423, 0.0417, 0.0419, 0.0415, 0.0412, 0.0410, 0.0406, 0.0404, 0.0402, 0.0399, 0.0395, 0.0392, 0.0394, 0.0391, 0.0387, 0.0386, 0.0382, 0.0381, 0.0380, 0.0378, 0.0376, 0.0374, 0.0372, 0.0367, 0.0367, 0.0367, 0.0364]
    line "Random" [0.1544, 0.3510, 0.2496, 0.2073, 0.1796, 0.1609, 0.1463, 0.1365, 0.1272, 0.1196, 0.1135, 0.1085, 0.1042, 0.1004, 0.0960, 0.0936, 0.0903, 0.0875, 0.0854, 0.0825, 0.0801, 0.0789, 0.0775, 0.0757, 0.0741, 0.0725, 0.0707, 0.0699, 0.0680, 0.0670, 0.0658, 0.0648, 0.0641, 0.0634, 0.0616, 0.0610, 0.0603, 0.0591, 0.0588, 0.0579, 0.0573, 0.0564, 0.0558, 0.0548, 0.0544, 0.0542, 0.0533, 0.0527, 0.0521, 0.0516, 0.0510, 0.0509, 0.0503, 0.0500, 0.0493, 0.0489, 0.0482, 0.0478, 0.0473, 0.0472, 0.0467, 0.0464, 0.0458, 0.0454, 0.0453, 0.0449, 0.0445, 0.0441, 0.0438, 0.0434, 0.0431, 0.0429, 0.0426, 0.0422, 0.0420, 0.0414, 0.0414, 0.0413, 0.0411, 0.0407, 0.0403, 0.0403, 0.0399, 0.0397, 0.0394, 0.0392, 0.0391, 0.0388, 0.0385, 0.0382, 0.0380, 0.0379, 0.0375, 0.0375, 0.0375, 0.0370, 0.0370, 0.0370, 0.0365, 0.0363]
```

```mermaid
xychart-beta
    title "Kendall Tau Rank Error vs Matches for 12 competitors"
    x-axis "Trials" 0 --> 9900
    line "Random" [0.7079, 0.6940, 0.6896, 0.6834, 0.6796, 0.6732, 0.6724, 0.6704, 0.6663, 0.6657, 0.6610, 0.6592, 0.6547, 0.6526, 0.6512, 0.6483, 0.6479, 0.6437, 0.6416, 0.6408, 0.6382, 0.6395, 0.6354, 0.6353, 0.6334, 0.6309, 0.6267, 0.6255, 0.6225, 0.6190, 0.6222, 0.6180, 0.6176, 0.6144, 0.6182, 0.6122, 0.6141, 0.6104, 0.6144, 0.6084, 0.6063, 0.6054, 0.6025, 0.6032, 0.6034, 0.5994, 0.5976, 0.6006, 0.5956, 0.5962, 0.5979, 0.5971, 0.5917, 0.5949, 0.5897, 0.5919, 0.5883, 0.5867, 0.5852, 0.5856, 0.5838, 0.5869, 0.5849, 0.5808, 0.5841, 0.5806, 0.5774, 0.5818, 0.5760, 0.5780, 0.5797, 0.5750, 0.5742, 0.5726, 0.5719, 0.5742, 0.5726, 0.5688, 0.5704, 0.5697, 0.5679, 0.5670, 0.5660, 0.5618, 0.5669, 0.5641, 0.5654, 0.5621, 0.5625, 0.5598, 0.5596, 0.5598, 0.5577, 0.5607, 0.5596, 0.5584, 0.5555, 0.5546, 0.5554, 0.5552]
    line "Random" [0.7063, 0.6935, 0.6886, 0.6850, 0.6802, 0.6759, 0.6726, 0.6704, 0.6640, 0.6604, 0.6612, 0.6570, 0.6530, 0.6531, 0.6492, 0.6469, 0.6461, 0.6461, 0.6417, 0.6423, 0.6347, 0.6351, 0.6350, 0.6315, 0.6313, 0.6276, 0.6286, 0.6252, 0.6246, 0.6234, 0.6206, 0.6191, 0.6167, 0.6171, 0.6157, 0.6122, 0.6140, 0.6124, 0.6105, 0.6082, 0.6085, 0.6060, 0.6040, 0.6051, 0.6015, 0.6007, 0.5997, 0.5997, 0.5980, 0.5977, 0.5953, 0.5959, 0.5932, 0.5937, 0.5933, 0.5909, 0.5863, 0.5855, 0.5852, 0.5888, 0.5859, 0.5855, 0.5868, 0.5851, 0.5821, 0.5804, 0.5817, 0.5809, 0.5795, 0.5787, 0.5769, 0.5763, 0.5749, 0.5752, 0.5725, 0.5704, 0.5733, 0.5702, 0.5709, 0.5683, 0.5682, 0.5678, 0.5683, 0.5648, 0.5610, 0.5647, 0.5646, 0.5634, 0.5636, 0.5589, 0.5632, 0.5621, 0.5570, 0.5571, 0.5584, 0.5592, 0.5574, 0.5571, 0.5550, 0.5548]
```

```mermaid
xychart-beta
    title "Odds Correct Winner vs Matches for 12 competitors"
    x-axis "Trials" 0 --> 9900
    line "Random" [0.0884, 0.1836, 0.2272, 0.2900, 0.3118, 0.3488, 0.3678, 0.3864, 0.4052, 0.4212, 0.4380, 0.4518, 0.4632, 0.4786, 0.4874, 0.4988, 0.5070, 0.5180, 0.5304, 0.5388, 0.5298, 0.5532, 0.5544, 0.5714, 0.5738, 0.5736, 0.5702, 0.5790, 0.5792, 0.5930, 0.5948, 0.5998, 0.5962, 0.6166, 0.6114, 0.6212, 0.6166, 0.6360, 0.6210, 0.6424, 0.6374, 0.6458, 0.6370, 0.6534, 0.6568, 0.6674, 0.6612, 0.6592, 0.6640, 0.6676, 0.6706, 0.6792, 0.6758, 0.6828, 0.6790, 0.6844, 0.6720, 0.6898, 0.6968, 0.6912, 0.6878, 0.6936, 0.7036, 0.7076, 0.7066, 0.7056, 0.6898, 0.7038, 0.7100, 0.7044, 0.7098, 0.7238, 0.7238, 0.7124, 0.7172, 0.7142, 0.7274, 0.7144, 0.7352, 0.7240, 0.7250, 0.7388, 0.7330, 0.7364, 0.7352, 0.7394, 0.7294, 0.7536, 0.7378, 0.7398, 0.7420, 0.7402, 0.7382, 0.7572, 0.7446, 0.7432, 0.7538, 0.7612, 0.7604, 0.7528]
    line "Round Robin" [0.0878, 0.2072, 0.2406, 0.2800, 0.3066, 0.3502, 0.3546, 0.3892, 0.4088, 0.4258, 0.4436, 0.4624, 0.4728, 0.4618, 0.4870, 0.4972, 0.5056, 0.5110, 0.5174, 0.5248, 0.5362, 0.5516, 0.5522, 0.5626, 0.5544, 0.5730, 0.5690, 0.5794, 0.5916, 0.5936, 0.5964, 0.6000, 0.5976, 0.6280, 0.6142, 0.6208, 0.6294, 0.6298, 0.6230, 0.6272, 0.6332, 0.6390, 0.6400, 0.6504, 0.6594, 0.6598, 0.6464, 0.6484, 0.6672, 0.6622, 0.6868, 0.6760, 0.6754, 0.6758, 0.6858, 0.6802, 0.6796, 0.6880, 0.6914, 0.6838, 0.6886, 0.7008, 0.6908, 0.7016, 0.7104, 0.7156, 0.7100, 0.7018, 0.6968, 0.7150, 0.7186, 0.7120, 0.7170, 0.7250, 0.7286, 0.7172, 0.7252, 0.7232, 0.7096, 0.7248, 0.7362, 0.7156, 0.7364, 0.7392, 0.7420, 0.7298, 0.7348, 0.7334, 0.7414, 0.7462, 0.7306, 0.7404, 0.7440, 0.7530, 0.7382, 0.7486, 0.7446, 0.7436, 0.7514, 0.7512]
```
