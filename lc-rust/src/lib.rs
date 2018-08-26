extern crate regex;
#[macro_use] extern crate lazy_static;
mod error;
mod scanner;
mod syntax;
#[macro_use] mod macros;
mod values;
mod grammar;
mod emitters;
mod std_lib;

use std::mem;
use error::*;
use scanner::scan;
use grammar::parse;
use emitters::emit_js::JavascriptEmitter;
use emitters::emit_html::HTMLEmitter;
use std_lib::add_std_lib;

pub fn transpile_js(src: &str) -> Result<String, Error> {
    let program = parse(scan(src)?)?;
    let program = add_std_lib(program);
    Ok(program.accept(&JavascriptEmitter {}))
}

pub fn transpile_html(src: &str) -> Result<String, Error> {
    let program = parse(scan(src)?)?;
    let program = add_std_lib(program);
    Ok(program.accept(&HTMLEmitter {}))
}

const NULL: u8 = 0;
const JS: u8 = 1;
const HTML: u8 = 2;
static mut SHARED_STRING: Option<String> = None;

#[no_mangle]
pub extern fn realloc_shared_string(length: usize) -> *const u8 {
    unsafe {
        match &SHARED_STRING {
            Some(s) if s.capacity() >= length => {
                let s = SHARED_STRING.take().unwrap();
                let ptr = s.as_ptr();
                let capacity = s.capacity();
                mem::forget(s);
                SHARED_STRING = Some(String::from_raw_parts(ptr as *mut _, length, capacity));
            },
            _ => {
                let new_string = String::with_capacity(length);
                let ptr = new_string.as_ptr();
                mem::forget(new_string);
                SHARED_STRING = Some(String::from_raw_parts(ptr as *mut _, length, length));
            }
        };
    }
    get_message_ptr()
}

#[no_mangle]
pub extern fn process(emit_format: u8) -> *const u8 {
    unsafe {
        match &SHARED_STRING {
            None => &NULL,
            Some(s) => {
                let result = match emit_format {
                    JS => transpile_js(s),
                    HTML => transpile_html(s),
                    _ => Ok("".to_string()),
                };
                match result {
                    Ok(s) => {
                        SHARED_STRING = Some(s);
                        get_message_ptr()
                    },
                    Err(e) => {
                        let err_msg = format!("! Compiler error\n{}", e.detailed_msg(s));
                        SHARED_STRING = Some(err_msg);
                        get_message_ptr()
                    }
                }
            }
        }
    }
}

#[no_mangle]
pub extern fn get_message_ptr() -> *const u8 {
    unsafe {
        match &SHARED_STRING {
            Some(s) => s.as_ptr(),
            None => &NULL,
        }
    }
}

#[no_mangle]
pub extern fn get_message_length() -> usize {
    unsafe {
        match &SHARED_STRING {
            Some(s) => s.len(),
            None => 0,
        }
    }
}
