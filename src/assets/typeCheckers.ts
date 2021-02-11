import { createParamDecorator } from "./validation"

export const Unsigned = createParamDecorator(param => ({
	validate: typeof param === "number" && param >= 0,
	error: Error(`Parameter = ${param} has a Signed bit (-ve)`),
}))

export const Int = createParamDecorator(param => ({
	validate: typeof param === "number" && (param % 1 === 0 || param === Infinity),
	error: Error(`Parameter = ${param} is not an Integer`),
}))

export const checkUnsigned = (num: number): void => {
	if (num < 0) throw Error("Number has a Signed bit (-ve)")
}

export const checkInt = (num: number): void => {
	if (num % 1 !== 0) throw Error("Numebr is not an Integer")
}
