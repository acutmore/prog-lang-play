
#[derive(Debug)]
pub struct Error {
    pub msg: String,
}

pub fn transpile_js(_src: &str) -> Result<String, Error> {
    Err(Error { msg: String::from("TODO: implement module") })
}
