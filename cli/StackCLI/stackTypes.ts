import { Fonts } from "figlet";

interface TypeChecking {
	NUMBER: (val: string) => boolean;
	BOOLEAN: (val: string) => boolean;
	STRING: (val: string) => boolean;
}

interface TypeConvertions {
	NUMBER: (val: string) => number;
	BOOLEAN: (val: string) => boolean;
	STRING: (val: string) => string;
}

interface ApplyOperations {
	PUSH: (val: anyType) => boolean;
	POP: () => null | anyType;
	PEEK: () => null | anyType;
	DISPLAY: () => Array<null | anyType>;
	BREAK: null;
}

type anyType = string | number | boolean;
type defTypes = keyof TypeChecking;
type defOpers = keyof ApplyOperations;

export { TypeChecking, TypeConvertions, ApplyOperations, anyType, defTypes, defOpers };

const fonts: Array<Fonts> = ["3D Diagonal", "4Max", "Crazy", "Impossible", "ANSI Shadow", "Block"];
