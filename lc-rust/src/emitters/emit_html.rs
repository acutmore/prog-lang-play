
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

#[derive(Copy, Clone)]
enum NodeIndex {
    None,
    Mixed,
    IndexAndWidth((u16, u16)),
}

impl NodeIndex {
    fn new(symbol: &SymbolInfo) -> NodeIndex {
        if symbol.at == 0 && symbol.width == 0 {
           NodeIndex::None
        } else {
            NodeIndex::IndexAndWidth((symbol.at, symbol.width))
        }
    }
}

pub struct HTMLEmitter {
    visited_parent: bool,
    child_index: NodeIndex
}

impl HTMLEmitter {
    pub fn new() -> HTMLEmitter {
        HTMLEmitter { visited_parent: false, child_index: NodeIndex::None }
    }
}

fn merge_branches(left: NodeIndex, right: NodeIndex) -> NodeIndex {
    match left {
        NodeIndex::None => right,
        NodeIndex::Mixed => NodeIndex::Mixed,
        NodeIndex::IndexAndWidth((index, width)) =>
            match right {
                NodeIndex::None
                    => NodeIndex::IndexAndWidth((index, width)),
                NodeIndex::IndexAndWidth((index2, _)) if index == index2
                    => NodeIndex::IndexAndWidth((index, width)),
                _
                    => NodeIndex::Mixed,
            },
    }
}

impl Visitor<String> for HTMLEmitter {
    fn visit_expression(&mut self, e: &Expression) -> String {
        match e {
            &Symbol(ref s) => {
                let has_parent = self.visited_parent;
                let index = NodeIndex::new(s);
                self.child_index = index;
                if let NodeIndex::None = index {
                    format!("{}", s.id)
                } else {
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
                let param_index = NodeIndex::new(s);
                let body = body.accept(self);
                let body_index = self.child_index;
                let child_index = merge_branches(param_index, body_index);
                self.child_index = child_index;
                if let NodeIndex::IndexAndWidth((index, width)) = child_index {
                    if has_parent {
                        format!("({} => {})", s.id, body)
                    } else {
                        format!("<span {}>({} => {})</span>", range_attributes(index, width), s.id, body)
                    }
                } else {
                    let body = if let NodeIndex::IndexAndWidth(i) = body_index {
                        format!("<span {}>{}</span>", range_attributes(i.0, i.1), body)
                    } else {
                        body
                    };
                    if let NodeIndex::IndexAndWidth(i) = param_index {
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
                self.child_index = child_index;
                if let NodeIndex::IndexAndWidth((index, width)) = child_index {
                    if has_parent {
                        format!("{}({})", left, right)
                    } else {
                        format!("<span {}>{}({})</span>", range_attributes(index, width), left, right)
                    }
                } else {
                    let right = if let NodeIndex::IndexAndWidth(i) = right_index {
                        format!("<span {}>{}</span>", range_attributes(i.0, i.1), right)
                    } else {
                        right
                    };

                    if let NodeIndex::IndexAndWidth(i) = left_index {
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
