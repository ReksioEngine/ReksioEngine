export class BinaryBuffer {
    public offset = 0
    public size = 0

    public view: DataView

    constructor(view: DataView) {
        this.view = view
        this.size = view.byteLength
        this.offset = view.byteOffset
    }

    /**
     * Gets the Float32 value at current offset
     */
    getFloat32(advance = true, littleEndian = true): number {
        const value = this.view.getFloat32(this.offset, littleEndian)
        this.offset += 4
        return value
    }

    /**
     * Gets the Float64 value at current offset
     */
    getFloat64(advance = true, littleEndian = true): number {
        const value = this.view.getFloat64(this.offset, littleEndian)
        this.offset += 8
        return value
    }

    /**
     * Gets the Int8 value at current offset
     */
    getInt8(advance = true): number {
        const value = this.view.getInt8(this.offset)
        this.offset += 1
        return value
    }

    /**
     * Gets the Int16 value at current offset
     */
    getInt16(advance = true, littleEndian = true): number {
        const value = this.view.getInt16(this.offset, littleEndian)
        if (advance) this.offset += 2
        return value
    }
    /**
     * Gets the Int32 value at current offset
     */
    getInt32(advance = true, littleEndian = true): number {
        const value = this.view.getInt32(this.offset, littleEndian)
        if (advance) this.offset += 4
        return value
    }

    /**
     * Gets the Uint8 value at current offset
     */
    getUint8(advance = true): number {
        const value = this.view.getUint8(this.offset)
        if (advance) this.offset += 1
        return value
    }

    /**
     * Gets the Uint16 value at current offset
     */
    getUint16(advance = true, littleEndian = true): number {
        const value = this.view.getUint16(this.offset, littleEndian)
        if (advance) this.offset += 2
        return value
    }

    /**
     * Gets the Uint32 value at current offset
     */
    getUint32(advance = true, littleEndian = true): number {
        const value = this.view.getUint32(this.offset, littleEndian)
        if (advance) this.offset += 4
        return value
    }

    /**
     * Stores an Float32 value at current offset
     */
    setFloat32(value: number, advance = true, littleEndian = true): void {
        this.view.setFloat32(this.offset, value, littleEndian)
        if (advance) this.offset += 4
    }

    /**
     * Stores an Float64 value at current offset
     */
    setFloat64(value: number, advance = true, littleEndian = true): void {
        this.view.setFloat64(this.offset, value, littleEndian)
        if (advance) this.offset += 8
    }

    /**
     * Stores an Int8 value at current offset
     */
    setInt8(value: number, advance = true): void {
        this.view.setInt8(this.offset, value)
        if (advance) this.offset += 1
    }

    /**
     * Stores an Int16 value at current offset
     */
    setInt16(value: number, advance = true, littleEndian = true): void {
        this.view.setInt16(this.offset, value, littleEndian)
        if (advance) this.offset += 1
    }

    /**
     * Stores an Int32 value at current offset
     */
    setInt32(value: number, advance = true, littleEndian = true): void {
        this.view.setInt32(this.offset, value, littleEndian)
        if (advance) this.offset += 4
    }

    /**
     * Stores an Uint8 value at current offset
     */
    setUint8(value: number, advance = true): void {
        this.view.setUint8(this.offset, value)
        if (advance) this.offset += 1
    }

    /**
     * Stores an Uint16 value at current offset
     */
    setUint16(value: number, advance = true, littleEndian = true): void {
        this.view.setUint16(this.offset, value, littleEndian)
        if (advance) this.offset += 2
    }

    /**
     * Stores an Uint32 value at current offset
     */
    setUint32(value: number, advance = true, littleEndian = true): void {
        this.view.setUint32(this.offset, value, littleEndian)
        if (advance) this.offset += 4
    }

    /**
     * Advance buffer offset by value
     * @param value
     */
    skip(value: number) {
        this.offset += value
    }

    ptr(offset: number) {
        const newBuffer = new BinaryBuffer(new DataView(this.view.buffer))
        newBuffer.offset = this.offset + offset
        return newBuffer
    }

    buffer() {
        return this.view.buffer
    }

    read(size: number) {
        const slice = this.view.buffer.slice(this.offset, this.offset + size)
        this.offset += size
        return slice
    }
}