import { ParseTree } from './RE_to_Tree';

const parseTree1 = new ParseTree('(a+b*).c.a*');
console.log(JSON.stringify(parseTree1.tree, null, '\t'));

const parseTree2 = new ParseTree('(a+b*).c.');
console.log(JSON.stringify(parseTree2.tree, null, '\t'));

const parseTree3 = new ParseTree('(a+b*).c.*');
console.log(JSON.stringify(parseTree3.tree, null, '\t'));
