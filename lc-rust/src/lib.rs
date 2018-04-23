extern crate regex;
#[macro_use] extern crate lazy_static;
mod error;
mod scanner;
mod syntax;
mod grammar;
mod emit_js;

use error::*;
use scanner::scan;
use grammar::parse;
use emit_js::JavascriptEmitter;

pub fn transpile_js(src: &str) -> Result<String, Error> {
    Ok(parse(scan(src)?)?.accept(&JavascriptEmitter {}))
}
