import inquirer, {
	Answers,
	CheckboxQuestion,
	InputQuestion,
	ConfirmQuestion,
	ListQuestion,
} from "inquirer";
import chalk from "chalk";

import * as $ from "./stackTypes";

async function initStackAskQs(typeChecking: $.TypeChecking): Promise<Answers> {
	const initStackQs: [CheckboxQuestion, ConfirmQuestion, InputQuestion] = [
		{
			name: "dataTypes",
			type: "checkbox",
			message: "Choose a Data Type for the Stack :",
			choices: Object.keys(typeChecking),
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
				if (!typeChecking["NUMBER"](ans) || Number(ans) <= 0 || Number(ans) >= 100)
					return chalk.red.underline.bold(ans);
				return chalk.blue(ans);
			},
			validate: (ans: string): boolean | string => {
				if (!typeChecking["NUMBER"](ans)) return "Enter a Valid Integer";
				if (Number(ans) <= 0) return "Stack Size should be > 0";
				if (Number(ans) >= 100) return "Stack Size should be < 100";
				return true;
			},
		},
	];
	const answers = await inquirer.prompt(initStackQs);
	return answers;
}

async function chooseOperAskQs(applyOperations: $.ApplyOperations): Promise<Answers> {
	const chooseOperQs: ListQuestion = {
		name: "operation",
		type: "list",
		loop: false,
		choices: Object.keys(applyOperations),
		message: "Choose an Operation to perform on the Stack :",
	};
	const answers = await inquirer.prompt(chooseOperQs);
	return answers;
}

async function getPushValueAskQs(
	hasMultipleTypes: boolean,
	typeChecking: $.TypeChecking,
	types: Array<$.defTypes>
): Promise<Answers> {
	const getPushValueQs: [ListQuestion, InputQuestion, ListQuestion] = [
		{
			name: "typeChosen",
			type: "list",
			loop: false,
			choices: types,
			message: "Choose the Type of Value to Push :",
			when: hasMultipleTypes,
		},
		{
			name: "value",
			type: "input",
			message: "Enter a Value to Push :\t",
			when: ({ typeChosen }: Answers): boolean => {
				const valueType = hasMultipleTypes ? <$.defTypes>typeChosen : types[0];
				return valueType !== "BOOLEAN";
			},
			transformer: (ans: string, { typeChosen }: Answers): string => {
				const valueType = hasMultipleTypes ? <$.defTypes>typeChosen : types[0];
				if (!typeChecking[valueType](ans)) return chalk.red.underline.bold(ans);
				return chalk.blue(ans);
			},
			validate: (ans: string, { typeChosen }: Answers): boolean | string => {
				const valueType = hasMultipleTypes ? <$.defTypes>typeChosen : types[0];
				if (!typeChecking[valueType](ans)) return "Enter a Valid Push for the given Type";
				return true;
			},
		},
		{
			name: "value",
			type: "list",
			choices: ["true", "false"],
			message: "Enter a Value to Push :\t",
			when: ({ typeChosen }: Answers): boolean => {
				const valueType = hasMultipleTypes ? <$.defTypes>typeChosen : types[0];
				return valueType === "BOOLEAN";
			},
		},
	];
	const answers = await inquirer.prompt(getPushValueQs);
	return answers;
}

export { initStackAskQs, chooseOperAskQs, getPushValueAskQs };
