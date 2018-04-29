extern crate regex;
#[macro_use] extern crate lazy_static;
mod error;
mod scanner;
mod syntax;
mod grammar;
mod emit_js;

use std::mem;
use error::*;
use scanner::scan;
use grammar::parse;
use emit_js::JavascriptEmitter;

pub fn transpile_js(src: &str) -> Result<String, Error> {
    Ok(parse(scan(src)?)?.accept(&JavascriptEmitter {}))
}

const NULL: u8 = 0;
static mut SHARED_STRING: Option<String> = None;

#[no_mangle]
pub extern fn realloc_shared_string(length: usize) -> *const u8 {
    unsafe {
        match &SHARED_STRING {
            Some(s) if s.capacity() >= length => {
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
                    Err(_) => &NULL
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
