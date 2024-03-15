export const libraries = {
    RANDOM: {
        // min - included, max - excluded
        GET: (min: number | string, max?: number | string) => {
            // Min and Max can be a string containing a number.
            // Probably behaviour's constant arguments can only be a string
            if (typeof min === 'string') {
                min = parseInt(min)
            }
            if (typeof max === 'string') {
                max = parseInt(max)
            }

            if (max === undefined) {
                return libraries.RANDOM.GET(0, min)
            }

            return Math.floor(Math.random() * (max - min)) + min
        }
    }
} as any
