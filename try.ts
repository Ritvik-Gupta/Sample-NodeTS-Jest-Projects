import { arrayRoundWalk, LazyArray } from "./src/LazyArray";

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
console.log(lazyArray.debug(1));
console.log(lazyArray.reduce(({ val, collected }) => collected + val.cos, { collected: 0 }));
console.log(lazyArray.debug(2));
const lazyArray1 = LazyArray.create(arr).roundWalk(7, 15);
console.log(lazyArray1.debug(2));
console.log(lazyArray1.roundWalk(2, 4).debug(2));
console.timeEnd("Lazy Array");
console.log("\n\n");
