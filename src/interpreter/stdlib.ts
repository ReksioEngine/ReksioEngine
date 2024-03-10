export const libraries = {
    RANDOM: {
        // min - included, max - excluded
        GET: (min: number, max?: number) => {
            if (max === undefined) {
                return libraries.RANDOM.GET(0, min)
            }
            return Math.floor(Math.random() * (max - min)) + min
        }
    }
} as any
