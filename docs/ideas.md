# Ideas

- Mix functional and imperitve styles
  - All functions are pure (or at least pure by default)
  - Data structures are imutable (or at least by default)
  - Variables are imutable (or at least by default)
  - Why? FP limits scope of complexity for reader. Easier (for me) to spike an idea in imperitive code

```
// Reverse is pure (the compiler could memoize it)

reverse is \list ->
    r_list is List.withSize(list.size)

    // r_list is mutable while in here

    list >> \v i ->
        r_list[-i] := v 
    .

    // aways returns last statement
    r_list
.
```

- Lambda Calcus...with DI
- - What about L.C with pattern matching?

```
// @identifier results in the parameter being auto supplied
// by the file 'add.baa'

\ @add . n . add n n 
```