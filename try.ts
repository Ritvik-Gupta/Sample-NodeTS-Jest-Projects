import { Stack, ParseTree } from './RE_to_Tree';

const parseTree = new ParseTree('(a+b*).c.a*');
console.log(parseTree);
