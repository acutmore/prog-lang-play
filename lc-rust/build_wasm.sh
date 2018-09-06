#!/bin/bash

# change working directory to script location
cd -P -- "$(dirname -- "$0")"

# compile rust to wasm
cargo +nightly build --target wasm32-unknown-unknown --release

# copy wasm for use by gui
cp ./target/wasm32-unknown-unknown/release/lc.wasm ../gui/dist
