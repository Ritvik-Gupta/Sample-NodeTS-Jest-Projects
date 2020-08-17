import ora from "ora";
import chalk from "chalk";
import figlet, { Fonts } from "figlet";
import prettyjson from "prettyjson";
import inquirer, { Answers } from "inquirer";

import { Stack, FiniteStack } from "../src/Stack";

type anyType = string | number | boolean;

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

type defTypes = keyof TypeChecking;
type defOpers = keyof ApplyOperations;

class StackCLI {
	private stack: Stack | FiniteStack;
	private types: Array<defTypes>;

	private typeChecking: TypeChecking;
	private typeConvertions: TypeConvertions;
	private applyOperations: ApplyOperations;

	private promiseFiglet = (text: string, font: Fonts = "Alpha"): Promise<string> =>
		new Promise((res, rej) => {
			figlet(
				text,
				{
					font: font,
					horizontalLayout: "full",
					verticalLayout: "full",
				},
				(err, figletText) => {
					if (err) rej(err);
					else res(figletText);
				}
			);
		});

	constructor(private logo: string) {
		this.stack = new Stack<anyType>();
		this.types = ["BOOLEAN"];

		this.typeChecking = {
			NUMBER: val => /^-?\d+(.\d+)?$/.test(val),
			BOOLEAN: val => val === "true" || val === "false",
			STRING: function (val) {
				return !this.NUMBER(val) && !this.BOOLEAN(val);
			},
		};

		this.typeConvertions = {
			NUMBER: val => Number(val),
			BOOLEAN: val => (val === "true" ? true : false),
			STRING: val => val,
		};

		this.applyOperations = {
			PUSH: val => this.stack?.push(val),
			POP: () => this.stack?.pop(),
			PEEK: () => this.stack?.peek,
			DISPLAY: () => this.stack?.array,
			BREAK: null,
		};

		this.startCLI();
	}

	private async startCLI(): Promise<void> {
		let texts: string | Array<string>;

		console.clear();
		texts = await this.promiseFiglet(this.logo, "ANSI Shadow");
		console.log(chalk.green.bold.dim(texts));

		const { dataTypes, stack } = await this.initStack();
		this.types = dataTypes;
		this.stack = stack;

		console.clear();
		texts = await Promise.all([
			this.promiseFiglet(
				`${
					stack instanceof FiniteStack
						? `Finite Stack (${stack.size})`
						: "Normal Stack ()"
				}`,
				"ANSI Shadow"
			),
			this.promiseFiglet(`< ${dataTypes.join(" + ")} >`, "Cursive"),
		]);
		texts.forEach(text => console.log(chalk.green.bold.dim(text)));

		while (true) {
			const oper = await this.chooseOper();
			if (oper === "BREAK") {
				break;
			} else if (oper === "PUSH") {
				const val = await this.getPushEl();
				this.applyOperations["PUSH"](val);
			} else {
				this.applyOperations[oper]();
			}
		}
	}

	private async initStack(): Promise<{
		dataTypes: Array<defTypes>;
		stack: Stack | FiniteStack;
	}> {
		const { isFiniteStack, dataTypes, size }: Answers = await inquirer.prompt([
			{
				name: "dataTypes",
				type: "checkbox",
				message: "Choose a Data Type for the Stack :",
				choices: Object.keys(this.typeChecking),
				validate: (ans: Array<string>) =>
					ans.length === 0 ? "Choose atleast one type for the Stack" : true,
			},
			{
				name: "isFiniteStack",
				type: "confirm",
				default: true,
				message: "Is it a Finite Stack ? ",
			},
			{
				name: "size",
				type: "input",
				message: "Enter the Size of Stack :\t",
				when: ({ isFiniteStack }: Answers) => isFiniteStack,
				transformer: (ans: string): string => {
					if (!this.typeChecking["NUMBER"](ans)) return chalk.red.bold(ans);
					if (Number(ans) <= 0 || Number(ans) >= 100)
						return chalk.red.underline(ans);
					return chalk.blue(ans);
				},
				validate: (ans: string): boolean | string => {
					if (!this.typeChecking["NUMBER"](ans)) return "Enter a Valid Integer";
					if (Number(ans) <= 0) return "Stack Size should be > 0";
					if (Number(ans) >= 100) return "Stack Size should be < 100";
					return true;
				},
			},
		]);

		let log = chalk`You chose a {blue.bold ${
			isFiniteStack ? "FINITE" : "NORMAL"
		}} Stack of {blue.underline ${dataTypes.join(" + ")}} Type`;
		log += isFiniteStack ? chalk` and of Size {blue.bold ${size}}` : "";
		console.log(log);

		const stack = isFiniteStack
			? new FiniteStack<anyType>(this.typeConvertions["NUMBER"](size))
			: new Stack<anyType>();
		return {
			dataTypes: dataTypes as Array<defTypes>,
			stack,
		};
	}

	private async chooseOper(): Promise<defOpers> {
		const { operation }: Answers = await inquirer.prompt({
			name: "operation",
			type: "list",
			loop: false,
			choices: Object.keys(this.applyOperations),
			message: "Choose an Operation to perform on the Stack :",
		});
		return <defOpers>operation;
	}

	private async getPushEl(): Promise<anyType> {
		const hasMultipleTypes = this.types.length > 1;
		const { typeChosen, value, booleanValue }: Answers = await inquirer.prompt([
			{
				name: "typeChosen",
				type: "list",
				loop: false,
				choices: this.types,
				message: "Choose the Type of Value to Push :",
				when: this.types.length > 1,
			},
			{
				name: "value",
				type: "input",
				message: "Enter a Value to Push :\t",
				when: ({ typeChosen }: Answers): boolean => {
					const valueType = hasMultipleTypes ? <defTypes>typeChosen : this.types[0];
					return valueType !== "BOOLEAN";
				},
				validate: (ans: string, { typeChosen }: Answers): boolean | string => {
					const valueType = hasMultipleTypes ? <defTypes>typeChosen : this.types[0];
					const checkValidity = this.typeChecking[valueType](ans);
					if (!checkValidity) return "Enter a Valid Push for the given Type";
					return true;
				},
			},
			{
				name: "value",
				type: "list",
				choices: ["true", "false"],
				message: "Enter a Value to Push :\t",
				when: ({ typeChosen }: Answers): boolean => {
					const valueType = hasMultipleTypes ? <defTypes>typeChosen : this.types[0];
					return valueType === "BOOLEAN";
				},
			},
		]);

		const valueType = hasMultipleTypes ? <defTypes>typeChosen : this.types[0];
		return this.typeConvertions[valueType](
			valueType !== "BOOLEAN" ? value : booleanValue
		);
	}
}

export default StackCLI;
