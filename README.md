
# prog-lang-play

A place where I can play around with implementing programming languages

https://acutmore.github.io/prog-lang-play/

# 'lc-rust' directory

Currently implements a 'lamba calculus based language' to 'javascript' transpiler written in Rust. [Originally implemented in Javascript](https://github.com/acutmore/prog-lang-play/blob/9656699caf15e3bb010e67ca239423c0427f7ee1/lc/index.js#L14).

To build a loadable [WASM](https://webassembly.org) file:

```bash
# requires rust to be installed
cd lc-rust
./build-wasm.sh
```

To run a REPL:

```js
node ./lc-rust/repl.js
loading...
ready
> 0
f => x => x
> 1
f => x => f(x)
> let identity = \x.x in identity 2
(identity => identity(f => x => f(f(x))))(x => x)
>
```

# 'GUI' directory

A basic website which allows a user to enter 'lc', see the generated javascript, run the program and see the result

```bash
cd gui
npm install
npm start
open http://localhost:8080
```
