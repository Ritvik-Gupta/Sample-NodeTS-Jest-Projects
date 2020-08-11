"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseTree = exports.Stack = void 0;
class Stack {
    constructor(size, arr) {
        this.size = size;
        this.arr = new Array(this.size).fill(null);
        this.top = -1;
        if (arr !== undefined)
            arr.forEach(el => this.push(el));
    }
    isFull() {
        return this.top === this.size - 1;
    }
    isEmpty() {
        return this.top === -1;
    }
    push(val) {
        if (this.isFull())
            return false;
        this.arr[++this.top] = val;
        return true;
    }
    pop() {
        if (this.isEmpty())
            return null;
        const val = this.arr[this.top];
        this.arr[this.top--] = null;
        return val;
    }
    get peek() {
        if (this.isEmpty())
            return null;
        return this.arr[this.top];
    }
    get array() {
        return [...this.arr];
    }
}
exports.Stack = Stack;
class ParseTree {
    constructor(regExp) {
        this.regExp = regExp;
        this.head = {
            value: '.',
            left: null,
            right: { value: '#', left: null, right: null },
        };
        this.createTree();
    }
    createTree() {
        const operStack = new Stack(this.regExp.length);
        const unitStack = new Stack(this.regExp.length);
        const operatorsPrec = new Map([
            ['*', 1],
            ['.', 2],
            ['+', 3],
        ]);
        const operators = new Map([
            [
                '*',
                () => {
                    const unit = unitStack.pop();
                    unitStack.push({ value: '*', left: unit, right: null });
                    operStack.pop();
                },
            ],
            [
                '.',
                () => {
                    const unit2 = unitStack.pop();
                    const unit1 = unitStack.pop();
                    unitStack.push({ value: '.', left: unit1, right: unit2 });
                    operStack.pop();
                },
            ],
            [
                '+',
                () => {
                    const unit2 = unitStack.pop();
                    const unit1 = unitStack.pop();
                    unitStack.push({ value: '+', left: unit1, right: unit2 });
                    operStack.pop();
                },
            ],
        ]);
        for (let r of this.regExp) {
            if (r === '(') {
                operStack.push(r);
            }
            else if (operatorsPrec.has(r)) {
                const operPrec = operatorsPrec.get(r);
                while (true) {
                    const prevOper = operStack.peek === null ? '' : operStack.peek;
                    const prevOperPrec = operatorsPrec.get(prevOper);
                    if (prevOperPrec === undefined || operPrec === undefined)
                        break;
                    if (prevOperPrec > operPrec)
                        break;
                    const getUnit = operators.get(prevOper);
                    if (getUnit !== undefined)
                        getUnit();
                }
                operStack.push(r);
            }
            else if (r === ')') {
                while (!operStack.isEmpty() && operStack.peek !== '(') {
                    const prevOper = operStack.peek === null ? '' : operStack.peek;
                    const getUnit = operators.get(prevOper);
                    if (getUnit !== undefined)
                        getUnit();
                }
                operStack.pop();
            }
            else {
                unitStack.push({ value: r, left: null, right: null });
            }
        }
        while (!operStack.isEmpty()) {
            const prevOper = operStack.peek === null ? '' : operStack.peek;
            const getUnit = operators.get(prevOper);
            if (getUnit !== undefined)
                getUnit();
        }
        console.log(unitStack);
        console.log(operStack);
    }
    static isValidRegExp(regExp) {
        return /^[a-z]\*?[.+][a-z]\*?$/i.test(regExp);
    }
    get tree() {
        return this.head;
    }
}
exports.ParseTree = ParseTree;
