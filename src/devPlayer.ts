import { createGamePlayer } from './index'
import { ArchiveOrgFileLoader, GithubFileLoader, IsoFileLoader } from './loaders/filesLoader'

const urlParams = new URLSearchParams(window.location.search)
const gameContainer = document.getElementById('game')
const baseOptions = {
    startScene: urlParams.get('scene') ?? undefined,
}

if (urlParams.get('loader') === 'iso-local') {
    const controls = document.getElementById('controls')!

    const fileSelector = document.createElement('input')
    fileSelector.type = 'file'
    fileSelector.addEventListener('change', async (event: any) => {
        controls.removeChild(fileSelector)
        createGamePlayer(gameContainer, {
            ...baseOptions,
            fileLoader: new IsoFileLoader(event.target.files[0]),
        })
    })

    controls.appendChild(fileSelector)
} else {
    const getFileLoader = () => {
        const loader = urlParams.get('loader')
        const source = urlParams.get('source')
        if (loader && source) {
            if (loader === 'github') {
                return new GithubFileLoader(source)
            } else if (loader === 'archiveorg') {
                return new ArchiveOrgFileLoader(source)
            }
        }
        return new GithubFileLoader('reksioiskarbpiratow')
    }

    createGamePlayer(gameContainer, {
        ...baseOptions,
        fileLoader: getFileLoader(),
    })
}
