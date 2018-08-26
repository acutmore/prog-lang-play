
#[cfg(test)]
mod tests {
    use super::*;
    use scanner::SrcPosition;

    #[test]
    fn it_emits_a_small_program() {
        let a = SymbolInfo::new((
            "a".to_string(),
            SrcPosition { line: 0, col: 0, index: 1, width: 1 }
        ));
        let b = SymbolInfo::new((
            "b".to_string(),
            SrcPosition { line: 0, col: 0, index: 0, width: 0 }
        ));
        let c = SymbolInfo::new((
            "c".to_string(),
            SrcPosition { line: 0, col: 0, index: 3, width: 1 }
        ));
        let ast = Application(
            Box::new(Function(a,  Box::new(Symbol(b)))),
            Box::new(Symbol(c)),
        );
        assert_eq!(
            ast.accept(&mut HTMLEmitter::new()),
            "<span data-lc-start=\"0b0000000000000001\" data-lc-end=\"0b0000000000000010\">(a => b)(</span><span data-lc-start=\"0b0000000000000011\" data-lc-end=\"0b0000000000000100\">c</span><span data-lc-start=\"0b0000000000000001\" data-lc-end=\"0b0000000000000010\">)</span>",
        );
    }
}

use syntax::*;
use syntax::Expression::*;

fn range_attributes(index: u16, width: u16) -> String {
    format!("data-lc-start=\"{:#018b}\" data-lc-end=\"{:#018b}\"",
        index,
        index + width,
    )
}

pub struct HTMLEmitter {
    visited_parent: bool,
    child_index: Option<(u16, u16)>,
}

impl HTMLEmitter {
    pub fn new() -> HTMLEmitter {
        HTMLEmitter { visited_parent: false, child_index: None }
    }
}

fn merge_branches(left: Option<(u16, u16)>, right: Option<(u16, u16)>) -> Option<(u16, u16)> {
    match left {
        None => right,
        Some((index, width)) =>
            match right {
                None => Some((index, width)),
                Some((index2, _)) if index == index2 => Some((index, width)),
                _ => None,
            },
    }
}

impl Visitor<String> for HTMLEmitter {
    fn visit_expression(&mut self, e: &Expression) -> String {
        match e {
            &Symbol(ref s) => {
                let has_parent = self.visited_parent;
                if s.at == 0 && s.width == 0 {
                    self.child_index = None;
                    format!("{}", s.id)
                } else {
                    self.child_index = Some((s.at, s.width));
                    if has_parent {
                        format!("{}", s.id)
                    } else {
                        format!("<span {}>{}</span>", range_attributes(s.at, s.width), s.id)
                    }
                }
            },
            &Function(ref s, ref body) => {
                let has_parent = self.visited_parent;
                self.visited_parent = true;
                let param_index = if s.at == 0 && s.width == 0 {
                    None
                } else {
                    Some((s.at, s.width))
                };
                let body = body.accept(self);
                let body_index = self.child_index;
                let child_index = merge_branches(param_index, body_index);
                if let Some((index, width)) = child_index {
                    if has_parent {
                        self.child_index = child_index;
                        format!("({} => {})", s.id, body)
                    } else {
                        format!("<span {}>({} => {})</span>", range_attributes(index, width), s.id, body)
                    }
                } else {
                    self.child_index = None;
                    let body = if let Some(i) = body_index {
                        format!("<span {}>{}</span>", range_attributes(i.0, i.1), body)
                    } else {
                        body
                    };
                    if let Some(i) = param_index {
                        let attr = range_attributes(i.0, i.1);
                        format!("<span {}>({} => </span>{}<span {}>)</span>", attr, s.id, body, attr)
                    } else {
                        return format!("({} => {})", s.id, body);
                    }
                }
            },
            &Application(ref left, ref right) => {
                let has_parent = self.visited_parent;
                self.visited_parent = true;
                let left = left.accept(self);
                let left_index = self.child_index;
                let right = right.accept(self);
                let right_index = self.child_index;
                let child_index = merge_branches(left_index, right_index);
                if let Some((index, width)) = child_index {
                    if has_parent {
                        self.child_index = child_index;
                        format!("{}({})", left, right)
                    } else {
                        format!("<span {}>{}({})</span>", range_attributes(index, width), left, right)
                    }
                } else {
                    self.child_index = None;
                    let right = if let Some(i) = right_index {
                        format!("<span {}>{}</span>", range_attributes(i.0, i.1), right)
                    } else {
                        right
                    };

                    if let Some(i) = left_index {
                        let left_attributes = range_attributes(i.0, i.1);
                        format!("<span {}>{}(</span>{}<span {}>)</span>", left_attributes, left, right, left_attributes)
                    } else {
                        format!("{}({})", left, right)
                    }
                }
            },
        }
    }
}
