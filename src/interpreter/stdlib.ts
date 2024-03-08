export const libraries = {
    RANDOM: {
        GET: (min: number, max: number) => {
            return Math.random() * (max - min) + min
        }
    }
} as any
