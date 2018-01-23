
# prog-lang-play

A place where I can play around with implementing programming languages

# 'LC' directory

Currently implements a lamba calculus to javascript transpiler.

To run a REPL:

```bash
node ./lc/repl.js
> \a.\b.\c.a b c
(a => ((b => ((c => (((a(b))(c))))))))
```

To execute the javascript just pipe into node

```bash
node ./lc/repl.js | node -i
> (\a.a) Array
((a => (a))(Array))
[Function: Array]
```
