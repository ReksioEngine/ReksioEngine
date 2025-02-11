import { Scene } from './types/scene'
import { UrlFileLoader } from '../loaders/filesLoader'

export const preloadAssets = async (fileLoader: UrlFileLoader, scene: Scene) => {
    const scenePath = scene.getRelativePath('').toLowerCase()

    const listing = fileLoader.getFilesListing()
    if (!listing) {
        return
    }

    await Promise.all(
        listing.map((filename) => {
            if (!filename.startsWith(scenePath)) {
                return
            }

            console.debug(`Preloading '${filename}'`)
            return fileLoader.getRawFile(filename)
        })
    )
}
