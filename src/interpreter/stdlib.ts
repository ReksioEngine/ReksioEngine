export const libraries = {
    RANDOM: {
        // min - included, max - excluded
        GET: (min: number, max: number) => {
            return Math.floor(Math.random() * (max - min)) + min
        }
    }
} as any
