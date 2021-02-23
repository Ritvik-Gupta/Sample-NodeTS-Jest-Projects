import "reflect-metadata"

type Function<T extends any[], U> = (...args: T) => U

interface IValidationFn {
	validate: boolean
	error: Error
}

interface IValidationIdx {
	index: number
	validationFn: Function<[any], IValidationFn>
}

type ParamDecorator = (validationFn: IValidationIdx["validationFn"]) => ParameterDecorator
const validationMetadataKey = Symbol("validate")

export const createParamDecorator: ParamDecorator = validationFn => (
	target,
	propertyKey,
	paramIndex
) => {
	const existingParams: IValidationIdx[] =
		Reflect.getOwnMetadata(validationMetadataKey, target, propertyKey) ?? []
	existingParams.push({ index: paramIndex, validationFn })
	Reflect.defineMetadata(validationMetadataKey, existingParams, target, propertyKey)
}

export const Validate = <T extends any[], U>(
	target: Object,
	propertyName: string | symbol,
	descriptor: TypedPropertyDescriptor<Function<T, U>>
) => {
	const method = descriptor.value!
	descriptor.value = function (...args: T): U {
		const decoratedParams: IValidationIdx[] =
			Reflect.getOwnMetadata(validationMetadataKey, target, propertyName) ?? []
		decoratedParams.forEach(paramIdx => {
			const validationResult = paramIdx.validationFn(args[paramIdx.index])
			if (!validationResult.validate) throw validationResult.error
		})
		return method.apply(this, args)
	}
}
