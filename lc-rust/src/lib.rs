extern crate regex;
#[macro_use] extern crate lazy_static;
mod error;
mod scanner;
mod syntax;
#[macro_use] mod macros;
mod values;
mod grammar;
mod emit_js;
mod std_lib;

use std::mem;
use error::*;
use scanner::scan;
use grammar::parse;
use emit_js::JavascriptEmitter;
use std_lib::add_std_lib;

pub fn transpile_js(src: &str) -> Result<String, Error> {
    let program = parse(scan(src)?)?;
    let program = add_std_lib(program);
    Ok(program.accept(&JavascriptEmitter {}))
}

const NULL: u8 = 0;
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
pub extern fn process() -> *const u8 {
    unsafe {
        match &SHARED_STRING {
            None => &NULL,
            Some(s) => {
                let result = transpile_js(s);
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
