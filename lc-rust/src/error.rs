
use scanner::SrcPosition;

#[derive(Debug)]
pub struct Error {
    pub msg: String,
    pub at: SrcPosition,
}
