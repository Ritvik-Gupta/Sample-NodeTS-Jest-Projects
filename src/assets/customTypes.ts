export type iterativeFn<T, U, IsMap extends boolean = false> = (
	elm: T,
	keyOrPos: IsMap extends true ? string : number
) => U

type atleastArr<T> = [T, ...T[]]
type argsFn<T> = (arg: T) => boolean

type orFn = <T>(...values: atleastArr<T>) => argsFn<T>
export const OR: orFn = (...values) => arg => values.some(value => arg === value)

type addOrFlags<T extends readonly any[]> = T extends readonly [infer U, ...infer V]
	? [argsFn<U> | U, ...addOrFlags<V>]
	: T

type anyFn = <T extends readonly any[]>(...values: atleastArr<addOrFlags<T>>) => argsFn<T>
export const ANY: anyFn = (...values) => args =>
	values.some(value => {
		for (let i = 0; i < args.length; ++i) {
			const fnOrVal = value[i]!
			const arg = args[i]!

			if (typeof fnOrVal === "function") {
				if (!fnOrVal(arg)) return false
			} else if (arg !== fnOrVal) return false
		}
		return true
	})
