import "reflect-metadata";
import { GraphNode } from "./GraphNode";

type Func<T extends any[], U> = (...args: T) => U;

interface IValidationFn {
	validate: boolean;
	error: Error;
}

interface IValidationIdx {
	index: number;
	validationFn: Func<[any], IValidationFn>;
}

type ParamDecorator = (validationFn: IValidationIdx["validationFn"]) => ParameterDecorator;
const validationMetadataKey = Symbol("validate");

const createParamDecorator: ParamDecorator = validationFn => (target, propertyKey, paramIndex) => {
	const existingParams: IValidationIdx[] =
		Reflect.getOwnMetadata(validationMetadataKey, target, propertyKey) ?? [];
	existingParams.push({ index: paramIndex, validationFn });
	Reflect.defineMetadata(validationMetadataKey, existingParams, target, propertyKey);
};

export const ID = createParamDecorator(param => ({
	validate: typeof param === "string" && GraphNode.validate(param),
	error: Error(`Node with ID = '${param}' not Initialized`),
}));
export const Unsigned = createParamDecorator(param => ({
	validate: typeof param === "number" && param >= 0 && param % 1 === 0,
	error: Error(`Parameter = ${param} is not of type Unsigned Int`),
}));

export const Validate = <T extends any[], U>(
	target: Object,
	propertyName: string | symbol,
	descriptor: TypedPropertyDescriptor<Func<T, U>>
) => {
	const method = descriptor.value!;
	descriptor.value = function (...args: T): U {
		const decoratedParams: IValidationIdx[] =
			Reflect.getOwnMetadata(validationMetadataKey, target, propertyName) ?? [];
		decoratedParams.forEach(paramIdx => {
			const validationResult = paramIdx.validationFn(args[paramIdx.index]);
			if (!validationResult.validate) throw validationResult.error;
		});
		return method.apply(this, args);
	};
};
