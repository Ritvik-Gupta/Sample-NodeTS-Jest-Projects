import { createArrayGen, LazyArray } from "./src/LazyArray";

const arr = Array.from({ length: 10 }, (_, pos) => pos * 15);
console.log("Array :\t", arr);

console.time("Lazy Array");
const lazyArray = LazyArray.create(arr)
	.map(({ val, pos }) => ({
		element: val,
		cos: Math.cos((Math.PI / 180) * val),
		str: pos.toString(),
	}))
	.filter(({ pos }) => pos % 2 === 0);
// console.log(lazyArray.debug());
console.log(lazyArray.reduce(({ val, collected }) => collected + val.cos, { collected: 0 }));
// console.log(lazyArray.debug());
const lazyArray1 = LazyArray.create(arr).roundWalk(7, 15);
console.log(lazyArray1.debug(2));
console.log(lazyArray1.debug(2));
console.timeEnd("Lazy Array");
console.log("\n\n");

// console.time("Normal Array");
// const array = arr;
// const array1 = array.map(val => ({
// 	element: val,
// 	cos: Math.cos((Math.PI / 180) * val),
// 	str: val.toString(),
// }));
// const array2 = array1.filter((val, pos) => val.cos > 0 && pos < 10);
// console.log(array2);
// console.timeEnd("Normal Array");
// console.log("\n\n");

const gen = createArrayGen(arr);
let nextVal = gen.next("none");
while (nextVal.done === false && nextVal.value.iteration < 2) {
	console.log(nextVal);
	nextVal = gen.next("none");
}
console.log("\n", nextVal, "\n");
gen.next("reset");
nextVal = gen.next("none");
while (nextVal.done === false && nextVal.value.iteration < 3) {
	console.log(nextVal);
	nextVal = gen.next("none");
}
console.log("\n", nextVal, "\n");
