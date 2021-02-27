import { InRange, Int, Unsigned, Validate } from "../assets"

export const containsParityBit = (num: number, parityBit: number) => (num & parityBit) === parityBit

export class HammingCode {
	protected readonly transmission: boolean[]

	public constructor(transmission: boolean[] | string) {
		this.transmission =
			typeof transmission === "string" ? HammingCode.parseBits(transmission) : transmission
		this.setHammingBits()
	}

	public print(): void {
		console.table(
			this.transmission.map((value, pos) =>
				(pos & (pos - 1)) === 0 ? { value, isParity: true } : { value }
			)
		)
	}

	public errorCorrection(): number | null {
		if (HammingCode.hasEvenOnes(this.transmission)) return null

		let errorPos = 0
		let parityBitPos = 1
		while (parityBitPos < this.transmission.length) {
			const parityBitCover = this.transmission.filter((_, pos) =>
				containsParityBit(pos, parityBitPos)
			)
			if (!HammingCode.hasEvenOnes(parityBitCover)) errorPos += parityBitPos
			parityBitPos *= 2
		}
		this.flipBit(errorPos)
		return errorPos
	}

	private flipBit(pos: number): void {
		this.transmission[pos] = !this.transmission[pos]
	}

	private setHammingBits(): void {
		let parityBitPos = 1
		while (parityBitPos < this.transmission.length) {
			const parityBitCover = this.transmission.filter((_, pos) =>
				containsParityBit(pos, parityBitPos)
			)
			if (!HammingCode.hasEvenOnes(parityBitCover)) this.flipBit(parityBitPos)
			parityBitPos *= 2
		}
		if (!HammingCode.hasEvenOnes(this.transmission)) this.flipBit(0)
	}

	private static parseBits(bits: string): boolean[] {
		const parsedBits: boolean[] = []
		for (const bit of bits) {
			if (bit === "1") parsedBits.push(true)
			else if (bit === "0") parsedBits.push(false)
			else throw Error("A Bit Representaion can only have 1 and 0 is the Unparsed Bit String")
		}
		return parsedBits
	}

	@Validate
	public generateNoise(
		@Unsigned @InRange({ lower: 0, higher: 0.5 }) noiseFactor: number
	): HammingCode {
		return new HammingCode(
			this.transmission.map(bit => {
				const hasNoise = Math.random() < noiseFactor
				return (!bit && hasNoise) || (bit && !hasNoise)
			})
		)
	}

	@Validate
	public manualNoise(@Unsigned @Int @InRange({ lower: 1 }) totalNoise: number): HammingCode {
		if (totalNoise > this.transmission.length)
			throw Error("Noise should atmost affect all the Transmission bits")

		const possibleNoisePos = this.transmission.map((_, pos) => pos)
		const totalNoisePos: number[] = []
		while (totalNoise > 0) {
			const randomPos = Math.floor(Math.random() * possibleNoisePos.length)
			totalNoisePos.push(...possibleNoisePos.splice(randomPos, 1))
			--totalNoise
		}

		const receiverNode = new HammingCode([...this.transmission])
		totalNoisePos.forEach(noisePos => receiverNode.flipBit(noisePos))
		return receiverNode
	}

	private static hasEvenOnes(bits: boolean[]): boolean {
		return bits.filter(isOne => isOne).length % 2 === 0
	}

	private static syndromeErrorPos(transmission: boolean[]): number {
		return transmission.reduce((coll, isOne, pos) => (isOne ? coll ^ pos : coll), 0)
	}

	private static numToBinary(num: number): boolean[] {
		const bits: boolean[] = []
		let parityBit = 1
		while (parityBit <= num) {
			bits.push(containsParityBit(num, parityBit))
			parityBit *= 2
		}
		return bits
	}

	public static syndrome(transmission: boolean[], noiseFactor: number): number {
		const senderNode = new HammingCode(transmission)
		const correctionPos = HammingCode.syndromeErrorPos(senderNode.transmission)
		HammingCode.numToBinary(correctionPos).forEach((bitIsOne, pos) => {
			if (bitIsOne) senderNode.flipBit(2 ** pos)
		})

		const receiverNode = senderNode.generateNoise(noiseFactor)
		const errorPos = HammingCode.syndromeErrorPos(receiverNode.transmission)
		receiverNode.flipBit(errorPos)

		return HammingCode.syndromeErrorPos(transmission)
	}
}

// for (let pos = 0; pos < 2056; ++pos)
// 	if (HammingCode.syndrome(Array.from({ length: pos }, () => Math.random() >= 0.5), 0) !== 0)
// 		console.log(pos)

process.argv.slice(2).forEach(unparsedBits => {
	const senderNode = new HammingCode(unparsedBits)
	senderNode.print()
	const receiverNode = senderNode.generateNoise(0.5)
	receiverNode.print()
	console.log("Error found at Position : \t", receiverNode.errorCorrection())
	receiverNode.print()
})
