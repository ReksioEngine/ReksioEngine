interface Logger {
    warn(message: string, extraData?: any, err?: any): void
    error(message: string, extraData?: any, err?: any): void
}

const noop = () => {}

export let logger: Logger = { warn: noop, error: noop }

export const setFormatsLogger = (newLogger: Logger) => {
    logger = newLogger
}
