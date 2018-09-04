const SEL_START = '>>';
const SEL_END = '<<';

let fib = `
let
  True =  λa.λb.a,
  False = λa.λb.b,
  isZero = λn.n (λ_.False) True,
  minusOne = λn.λf.λx.n (λg.λh.h (g f)) (λ_.x) (λi.i),
  minus = λm.λn. n minusOne m,
  minusTwo = λn.minus n 2,
  lessOrEqual = λn.λm. isZero (minus m n),
  leqOne = lessOrEqual 1,
  add = λn.λm.(λf.λx.m f (n f x)),
  ${SEL_START}fibFix = λfib.λn. (
    if isZero n
      then 0
      else if leqOne n
        then 1
        else add
          (fib fib (minusOne n))
          (fib fib (minusTwo n))

  )${SEL_END},
  fib = fibFix fibFix
in
  fib 8

`;
const selectionStart = fib.indexOf(SEL_START);
fib = fib.replace(SEL_START, '');
const selectionEnd = fib.indexOf(SEL_END);
fib = fib.replace(SEL_END, '');

module.exports = {
  fib,
  selectionStart,
  selectionEnd,
};
