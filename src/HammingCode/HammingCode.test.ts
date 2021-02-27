import { HammingCode } from "./HammingCode"

class HammingCodeMock extends HammingCode {
	public static totalErrors(
		{ transmission }: HammingCodeMock,
		{ transmission: receivedTransmission }: HammingCodeMock
	): number {
		if (transmission.length !== receivedTransmission.length)
			throw Error("Transmissions should have the same Length")

		let totalErrors = 0
		transmission.forEach((bit, pos) => {
			if (bit !== receivedTransmission[pos]) ++totalErrors
		})
		return totalErrors
	}

	public static haveSameTransmissions(
		{ transmission }: HammingCodeMock,
		{ transmission: receivedTransmission }: HammingCodeMock
	): boolean {
		if (transmission.length !== receivedTransmission.length)
			throw Error("Transmissions should have the same Length")

		for (let pos = 0; pos < transmission.length; ++pos)
			if (transmission[pos] !== receivedTransmission[pos]) return false
		return true
	}
}

const randomBoolean = () => Math.random() > 0.5
const randomLength = Math.floor(Math.random() * 10000)

interface IDataset {
	transmission: boolean[]
	noiseFactor: number
	totalNoise: number
}

const dataset: IDataset[] = [
	{
		transmission: Array.from({ length: randomLength }, randomBoolean),
		noiseFactor: Math.random() / 2,
		totalNoise: Math.ceil(Math.random() * randomLength),
	},
	{ transmission: Array.from({ length: 2048 }, randomBoolean), noiseFactor: 0.4, totalNoise: 1000 },
]

describe.each(dataset)(
	"Mock Hamming Code Instance with dataset [ %# ]",
	({ transmission, noiseFactor, totalNoise }) => {
		const senderNode = new HammingCodeMock(transmission)

		test("Correctness of Hamming Coded Transmission when Generated Noise", () => {
			const receiverNode = senderNode.generateNoise(noiseFactor)
			const totalErrors = HammingCodeMock.totalErrors(senderNode, receiverNode)
			receiverNode.errorCorrection()

			expect(HammingCodeMock.haveSameTransmissions(senderNode, receiverNode)).toBe(totalErrors <= 1)
		})

		test("Correctness of Hamming Coded Transmission when added Noise Manually", () => {
			const receiverNode = senderNode.manualNoise(totalNoise)
			const totalErrors = HammingCodeMock.totalErrors(senderNode, receiverNode)
			receiverNode.errorCorrection()

			expect(HammingCodeMock.haveSameTransmissions(senderNode, receiverNode)).toBe(totalErrors <= 1)
		})
	}
)
