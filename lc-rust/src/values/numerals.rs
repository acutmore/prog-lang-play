
use syntax::Expression;

/// Given an integer literal will return the coresponding church numeral.
/// Unlike get_church_numeral this will not reduce large numbers down into
/// shorter expressions. i.e. 999 will return a function with 999 calls to 'f'
fn get_plain_church_numeral(v: u32) -> Box<Expression> {
    match v {
        0 => lc!{λ"f".λ"x"."x"},
        _ => {
            let mut body = lc!{("f" "x")};
            for _ in 1..v {
                body = lc!{("f" body)}
            }
            lc!{λ"f".λ"x".body}
        }
    }
}

fn e10(digit: u32, place: u32) -> Box<Expression> {
    let digit = get_plain_church_numeral(digit);
    match place {
        0 => digit,
        1 => {
            // digit * 10
            lc!{λ"f".("Ten" (digit "f"))}
        },
        _ => {
            // digit * (10^place)
            let place_expression = get_plain_church_numeral(place);
            lc!{λ"f".(digit ((place_expression "Ten") "f"))}
        }
    }
}

fn add(a: Box<Expression>, b: Box<Expression>) -> Box<Expression> {
    lc!{λ"f".λ"x".((a "f") ((b "f") "x"))}
}

struct Digits {
    n: u32,
}

impl Iterator for Digits {
    type Item = u32;

    fn next(&mut self) -> Option<u32> {
        let n = self.n;
        if n == 0 {
            return None;
        }
        self.n = n / 10;
        Some(n % 10)
    }
}

/// Given an integer literal will return the coresponding church numeral
pub fn get_church_numeral(v: u32) -> Box<Expression> {
    if v == 0 {
        return lc!{λ"f".λ"x"."x"};
    }

    let mut next_place = 0;
    let mut e: Option<Box<Expression>> = None;
    for digit in (Digits {n: v}) {
        let place = next_place;
        next_place = place + 1;
        if digit == 0 {
            continue;
        }
        let in_place = e10(digit, place);
        if e.is_none() {
            e = Some(in_place);
            continue;
        }
        e = Some(add(in_place, e.unwrap()));
    }
    e.unwrap()
}
