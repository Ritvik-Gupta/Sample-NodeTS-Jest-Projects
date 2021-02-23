import { createParamDecorator } from "./validation"

export const Unsigned = createParamDecorator(param => ({
	validate: typeof param === "number" && param >= 0,
	error: Error(`Parameter = ${param} has a Signed bit (-ve)`),
}))

export const Int = createParamDecorator(param => ({
	validate: typeof param === "number" && (param % 1 === 0 || param === Infinity),
	error: Error(`Parameter = ${param} is not an Integer`),
}))

export const InRange = (limits: { lower?: number; higher?: number }) =>
	createParamDecorator(param => {
		const lower = limits.lower ?? -Infinity,
			higher = limits.higher ?? Infinity
		return {
			validate: typeof param === "number" && lower <= param && param <= higher,
			error: Error(`Parameter = ${param} does not lie in the range = [ ${lower}, ${higher} ]`),
		}
	})

export const checkUnsigned = (num: number): void => {
	if (num < 0) throw Error("Number has a Signed bit (-ve)")
}

export const checkInt = (num: number): void => {
	if (num % 1 !== 0) throw Error("Numebr is not an Integer")
}
