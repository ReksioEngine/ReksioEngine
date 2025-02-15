import { Scene } from './types/scene'
import { FileLoader, UrlFileLoader } from '../loaders/filesLoader'

export const preloadAssets = async (fileLoader: FileLoader, scene: Scene) => {
    if (!(fileLoader instanceof UrlFileLoader)) {
        return
    }

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
