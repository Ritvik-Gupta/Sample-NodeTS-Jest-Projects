"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RE_to_Tree_1 = require("./RE_to_Tree");
const parseTree1 = new RE_to_Tree_1.ParseTree('(a+b*).c.a*');
console.log(JSON.stringify(parseTree1.tree, null, '\t'));
const parseTree2 = new RE_to_Tree_1.ParseTree('(a+b*).c.');
console.log(JSON.stringify(parseTree2.tree, null, '\t'));
const parseTree3 = new RE_to_Tree_1.ParseTree('(a+b*).c.*');
console.log(JSON.stringify(parseTree3.tree, null, '\t'));
