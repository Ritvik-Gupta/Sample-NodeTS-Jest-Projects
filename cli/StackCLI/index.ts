import chalk from "chalk";
import figlet, { Fonts } from "figlet";
import { Answers } from "inquirer";
import { FiniteStack, Stack } from "../../src/Stack";
import { chooseOperAskQs, getPushValueAskQs, initStackAskQs } from "./questions";
import * as $ from "./stackTypes";

class StackCLI {
	private stack: Stack<$.anyType> | FiniteStack<$.anyType>;
	private types: Array<$.defTypes>;

	private typeChecking: $.TypeChecking;
	private typeConvertions: $.TypeConvertions;
	private applyOperations: $.ApplyOperations;

	private promiseFiglet = (text: string, font: Fonts = "ANSI Shadow"): Promise<string> =>
		new Promise((res, rej) => {
			figlet(
				text,
				{
					font: font,
					horizontalLayout: "controlled smushing",
					verticalLayout: "controlled smushing",
				},
				(err, figletText) => {
					if (err) rej(err);
					else res(figletText);
				}
			);
		});

	constructor(private logo: string) {
		this.stack = new Stack<$.anyType>();
		this.types = ["BOOLEAN"];

		this.typeChecking = {
			NUMBER: val => !isNaN(Number(val)),
			BOOLEAN: val => val === "true" || val === "false",
			STRING: val => isNaN(Number(val)) && val !== "true" && val !== "false",
		};

		this.typeConvertions = {
			NUMBER: val => Number(val),
			BOOLEAN: val => (val === "true" ? true : false),
			STRING: val => val,
		};

		this.applyOperations = {
			PUSH: val => this.stack.push(val),
			POP: () => this.stack.pop(),
			PEEK: () => this.stack.peek,
			DISPLAY: () => this.stack.array,
			BREAK: null,
		};

		this.startCLI();
	}

	private async startCLI(): Promise<void> {
		let texts: string | Array<string>;

		console.clear();
		texts = await this.promiseFiglet(this.logo);
		console.log(chalk.green.bold.dim(texts));

		const { dataTypes, stack } = await this.initStack();
		this.types = dataTypes;
		this.stack = stack;

		console.clear();
		console.log("\n");
		texts = await Promise.all([
			this.promiseFiglet(
				stack instanceof FiniteStack ? `Finite Stack (${stack.size})` : "Infinite Stack ()"
			),
			this.promiseFiglet(`< ${dataTypes.join(" + ")} >`, "Cursive"),
		]);
		texts.forEach(text => console.log(chalk.green.bold.dim(text)));

		while (true) {
			const oper = await this.chooseOper();
			if (oper === "BREAK") {
				break;
			} else if (oper === "PUSH") {
				const val = await this.getPushValue();
				this.applyOperations["PUSH"](val);
			} else {
				this.applyOperations[oper]();
			}
		}
	}

	private async initStack(): Promise<{
		dataTypes: Array<$.defTypes>;
		stack: Stack<$.anyType> | FiniteStack<$.anyType>;
	}> {
		const { isFiniteStack, dataTypes, size }: Answers = await initStackAskQs(this.typeChecking);

		const stack = isFiniteStack
			? new FiniteStack<$.anyType>(this.typeConvertions["NUMBER"](size))
			: new Stack<$.anyType>();
		return {
			dataTypes: dataTypes as Array<$.defTypes>,
			stack,
		};
	}

	private async chooseOper(): Promise<$.defOpers> {
		const { operation }: Answers = await chooseOperAskQs(this.applyOperations);
		return <$.defOpers>operation;
	}

	private async getPushValue(): Promise<$.anyType> {
		const hasMultipleTypes = this.types.length > 1;
		const { typeChosen, value, booleanValue }: Answers = await getPushValueAskQs(
			hasMultipleTypes,
			this.typeChecking,
			this.types
		);

		const valueType = hasMultipleTypes ? <$.defTypes>typeChosen : this.types[0];
		return this.typeConvertions[valueType](valueType !== "BOOLEAN" ? value : booleanValue);
	}
}

export default StackCLI;
