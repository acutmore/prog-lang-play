extern crate regex;
#[macro_use] extern crate lazy_static;
mod error;
mod scanner;
mod syntax;

use error::*;

pub fn transpile_js(_src: &str) -> Result<String, Error> {
    Err(Error { msg: String::from("TODO: implement module") })
}
