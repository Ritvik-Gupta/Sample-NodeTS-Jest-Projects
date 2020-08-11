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
    at(n) {
        if (n > this.size || n < 0)
            return null;
        return this.arr[n];
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
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const operStack = new Stack(this.regExp.length);
        const unitStack = new Stack(this.regExp.length);
        const unaryOperation = (type) => () => {
            const unit = unitStack.pop();
            unitStack.push({ value: type, left: unit, right: null });
            operStack.pop();
        };
        const binaryOperation = (type) => () => {
            const unit2 = unitStack.pop();
            const unit1 = unitStack.pop();
            unitStack.push({ value: type, left: unit1, right: unit2 });
            operStack.pop();
        };
        const operators = new Map([
            ['*', { pos: 1, apply: unaryOperation('*') }],
            ['.', { pos: 2, apply: binaryOperation('.') }],
            ['+', { pos: 3, apply: binaryOperation('+') }],
        ]);
        for (let r of this.regExp) {
            if (r === '(') {
                operStack.push(r);
            }
            else if (r === ')') {
                while (!operStack.isEmpty() && operStack.peek !== '(') {
                    const prevOper = operators.get((_a = operStack.peek) !== null && _a !== void 0 ? _a : '');
                    if (prevOper === undefined)
                        return false;
                    prevOper.apply();
                }
                operStack.pop();
            }
            else if (operators.has(r)) {
                const operPos = (_c = (_b = operators.get(r)) === null || _b === void 0 ? void 0 : _b.pos) !== null && _c !== void 0 ? _c : -1;
                while (!operStack.isEmpty() && operStack.peek !== '(') {
                    const prevOperPos = (_f = (_e = operators.get((_d = operStack.peek) !== null && _d !== void 0 ? _d : '')) === null || _e === void 0 ? void 0 : _e.pos) !== null && _f !== void 0 ? _f : -1;
                    if (prevOperPos > operPos)
                        break;
                    const prevOper = operators.get((_g = operStack.peek) !== null && _g !== void 0 ? _g : '');
                    if (prevOper === undefined)
                        return false;
                    prevOper.apply();
                }
                operStack.push(r);
            }
            else {
                unitStack.push({ value: r, left: null, right: null });
            }
        }
        while (!operStack.isEmpty()) {
            const prevOper = operators.get((_h = operStack.peek) !== null && _h !== void 0 ? _h : '');
            if (prevOper === undefined)
                return false;
            else
                prevOper.apply();
        }
        this.head.left = unitStack.at(0);
        return true;
    }
    get tree() {
        return this.head;
    }
}
exports.ParseTree = ParseTree;
