"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RE_to_Tree_1 = require("./RE_to_Tree");
const parseTree = new RE_to_Tree_1.ParseTree('(a+b*).c.a*');
console.log(parseTree);
