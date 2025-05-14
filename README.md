# Bricks

Requires modern versions of node and npm etc.

```
npm i
npm run dev
```

## Notes

'Optimized' algorithm: greedy algorithm. On each loop, find a set of candidate bricks with supporters and score them based on the number of bricks that could be placed in the next stride.

As I understand it, this problem is np-hard (because it's essentially just the set-covering problem). There's definitely heuristic optimizations that could be made though - the final two strides, one of which is a single brick, are a good example of this.

## Bonuses and further work

Tests: not 100% clear from the problem description what the purpose of this code is. Presumably the frontend is not very important (just a way to visualise the problem to validate the solution), so I would primarily focus on writing tests for the 'core' components, which are designed to be able to be used like a library.

Bonus A: This bonus asks for different brickwork patterns, suggesting either English Cross or Flemish bond. This bonus is mostly about the change from alternating stretcher bricks only (as in the original problem) to alternating stretchers and headers. The main modification is in the wall generating code, which in this codebase is already a bit over-engineered for the original problem. The actual predicate in the stride heuristic algorithm shouldn't change: the supporting bricks can still be calculated the same way.

Bonus B: Would need more time to think about this exactly but it seems possible on first glance to use some kind of greedy algorithm to generate the wall. At every step, randomly select either a full or half brick first, and then check the courses below to see if it can be placed while fulfilling the rules. Probably the complexity is in handling the (literal) edge cases.