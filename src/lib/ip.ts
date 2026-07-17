/**
 * IP address format conversion utilities
 */

/**
 * Validates if a string is a valid IPv4 address
 */
function isValidIPv4(ip: string): boolean {
    const parts = ip.split('.')
    if (parts.length !== 4) return false

    for (const part of parts) {
        const num = parseInt(part, 10)
        if (isNaN(num) || num < 0 || num > 255 || part !== num.toString()) {
            return false
        }
    }
    return true
}

/**
 * Convert IPv4 address to decimal format
 */
export function ipToDecimal(ip: string): string {
    if (!isValidIPv4(ip)) {
        throw new Error('Invalid IPv4 address format')
    }

    const parts = ip.split('.').map(part => parseInt(part, 10))
    const decimal = (parts[0] * 256 * 256 * 256) + (parts[1] * 256 * 256) + (parts[2] * 256) + parts[3]
    return decimal.toString()
}

/**
 * Convert decimal to IPv4 address
 */
export function decimalToIp(decimal: string): string {
    const num = parseInt(decimal, 10)
    if (isNaN(num) || num < 0 || num > 4294967295) {
        throw new Error('Invalid decimal number for IPv4 conversion')
    }

    const a = Math.floor(num / (256 * 256 * 256))
    const b = Math.floor((num % (256 * 256 * 256)) / (256 * 256))
    const c = Math.floor((num % (256 * 256)) / 256)
    const d = num % 256

    return `${a}.${b}.${c}.${d}`
}

/**
 * Convert IPv4 address to binary format
 */
export function ipToBinary(ip: string): string {
    if (!isValidIPv4(ip)) {
        throw new Error('Invalid IPv4 address format')
    }

    const parts = ip.split('.').map(part => parseInt(part, 10))
    const binaryStr = parts.map(part => part.toString(2).padStart(8, '0')).join('')
    return '0b' + binaryStr
}

/**
 * Convert binary to IPv4 address
 */
export function binaryToIp(binary: string): string {
    // Handle both dotted binary (11111111.00000000.00000000.00000001) and continuous binary
    let binaryStr = binary.replace(/\./g, '').replace(/\s/g, '').replace(/0b/gi, '')

    if (binaryStr.length !== 32 || !/^[01]+$/.test(binaryStr)) {
        throw new Error('Invalid binary format for IPv4 conversion')
    }

    const parts = []
    for (let i = 0; i < 32; i += 8) {
        const octet = binaryStr.substr(i, 8)
        const decimal = parseInt(octet, 2)
        if (decimal > 255) {
            throw new Error('Invalid binary format for IPv4 conversion')
        }
        parts.push(decimal)
    }

    return parts.join('.')
}

/**
 * Convert IPv4 address to hexadecimal format
 */
export function ipToHexadecimal(ip: string): string {
    if (!isValidIPv4(ip)) {
        throw new Error('Invalid IPv4 address format')
    }

    const parts = ip.split('.').map(part => parseInt(part, 10))
    return "0x" + parts.map(part => part.toString(16).padStart(2, '0').toUpperCase()).join('.')
}

/**
 * Convert hexadecimal to IPv4 address
 */
export function hexadecimalToIp(hex: string): string {
    // Handle both dotted hex (FF.00.00.01) and continuous hex
    let hexStr = hex.replace(/\./g, '').replace(/\s/g, '').replace(/0x/gi, '')

    if (hexStr.length !== 8 || !/^[0-9A-Fa-f]+$/.test(hexStr)) {
        throw new Error('Invalid hexadecimal format for IPv4 conversion')
    }

    const parts = []
    for (let i = 0; i < 8; i += 2) {
        const octet = hexStr.substr(i, 2)
        const decimal = parseInt(octet, 16)
        parts.push(decimal)
    }

    return parts.join('.')
}

/**
 * Convert IPv4 address to octal format
 */
export function ipToOctal(ip: string): string {
    if (!isValidIPv4(ip)) {
        throw new Error('Invalid IPv4 address format')
    }

    const parts = ip.split('.').map(part => parseInt(part, 10))
    return parts.map(part => '0' + part.toString(8)).join('.')
}

/**
 * Convert octal to IPv4 address
 */
export function octalToIp(octal: string): string {
    // Handle both dotted octal (0377.0000.0000.0001) and continuous octal
    const parts = octal.split('.')

    if (parts.length !== 4) {
        throw new Error('Invalid octal format for IPv4 conversion')
    }

    const decimals = parts.map(part => {
        // Remove leading '0' prefix if present
        const cleanPart = part.replace(/^0+/, '') || '0'
        if (!/^[0-7]+$/.test(cleanPart)) {
            throw new Error('Invalid octal format for IPv4 conversion')
        }
        const decimal = parseInt(cleanPart, 8)
        if (decimal > 255) {
            throw new Error('Invalid octal format for IPv4 conversion')
        }
        return decimal
    })

    return decimals.join('.')
}
