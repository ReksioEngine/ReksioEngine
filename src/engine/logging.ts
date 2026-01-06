class TextFormatting {
    constructor(
        public text: string,
        public richText: string,
        public args: string[]
    ) {}
}

export const color = (color: string, text: string) => {
    return new TextFormatting(text, `%c${text}%c`, [`color: ${color}`, 'color: inherit'])
}

export const red = (text: string) => color('red', text)
export const bold = (text: string) =>
    new TextFormatting(text, `%c${text}%c`, ['font-weight: bold', 'font-weight: inherit'])

export const codeHighlight = (codeParts: string[]) => {
    const rawText = codeParts.join('').trimEnd().split(';').join(';\n')
    const richText = `${codeParts[0]}%c${codeParts[1]}%c${codeParts[2]}`.trimEnd().split(';').join(';\n')
    return new TextFormatting(rawText, richText, ['color: red', 'color: inherit'])
}

type FormatInfo = {
    text: string
    richText: string
    richArgs: string[]
}

export const fmt = (strings: TemplateStringsArray, ...values: any[]): FormatInfo => {
    let richText = ''
    let rawText = ''
    const args = []

    for (let i = 0, l = strings.length; i < l; i++) {
        richText += strings[i]
        rawText += strings[i]
        if (i !== strings.length - 1) {
            const value = values.shift()
            if (value instanceof TextFormatting) {
                richText += value.richText
                rawText += value.text
                args.push(...value.args)
            } else {
                richText += value.toString()
                rawText += value.toString()
            }
        }
    }

    return {
        text: rawText,
        richText: richText,
        richArgs: args,
    }
}

export const allLogs: any[] = []

class Logger {
    private severityMapping: Record<string, any> = {
        info: console.log,
        warn: console.warn,
        error: console.error,
        debug: console.debug,
    }

    private appendExtraData(formatting: FormatInfo, extraData?: any) {
        const { text, richText, richArgs } = formatting

        let richTextCopy = richText
        const richArgsCopy: any[] = [...richArgs]

        if (extraData && Object.entries(extraData).length > 0) {
            richTextCopy += '\n'
            for (const [key, value] of Object.entries(extraData)) {
                if (key.startsWith('_')) {
                    continue
                }
                richTextCopy += `%c${key}%c: %O\n`
                richArgsCopy.push('font-weight: bold', 'font-weight: inherit', value)
            }
            richTextCopy = richTextCopy.trimEnd()
        }

        return {
            text: text,
            richText: richTextCopy,
            richArgs: richArgsCopy,
            extraData,
        }
    }

    private printLog(severity: string, formatting: string | FormatInfo, extraData?: any, err?: Error) {
        const formatInfo: FormatInfo =
            typeof formatting === 'string'
                ? {
                      text: formatting,
                      richText: formatting,
                      richArgs: [],
                  }
                : formatting

        const formatInfoWithExtra = this.appendExtraData(formatInfo, extraData)
        allLogs.push({
            type: severity,
            text: formatInfo.text,
            error: err,
            extraData,
        })

        this.severityMapping[severity](formatInfoWithExtra.richText, ...formatInfoWithExtra.richArgs)
        if (err) {
            this.severityMapping[severity](err)
        }
    }

    log(formatting: string | FormatInfo, extraData?: any, err?: any) {
        this.printLog('info', formatting, extraData, err)
    }

    warn(formatting: string | FormatInfo, extraData?: any, err?: any) {
        this.printLog('warn', formatting, extraData, err)
    }

    debug(formatting: string | FormatInfo, extraData?: any, err?: any) {
        this.printLog('debug', formatting, extraData, err)
    }

    error(formatting: string | FormatInfo, extraData?: any, err?: any) {
        this.printLog('error', formatting, extraData, err)
    }
}

export const logger = new Logger()
