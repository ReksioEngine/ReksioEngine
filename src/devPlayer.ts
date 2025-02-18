import { createGamePlayer, GamePlayerOptions } from './index'
import { ArchiveOrgFileLoader, GithubFileLoader, IsoFileLoader } from './loaders/filesLoader'

const urlParams = new URLSearchParams(window.location.search)
const gameContainer = document.getElementById('game')
const debugContainer = document.getElementById('debug')
const baseOptions = {
    startScene: urlParams.get('scene') ?? undefined,
    debug: urlParams.has('debug') ? urlParams.get('debug') == 'true' : (process.env.debug as unknown as boolean),
    debugContainer: debugContainer,
}

let config = {}
const start = () => {
    gameContainer!.removeEventListener('click', start)
    gameContainer!.classList.remove('notready')
    createGamePlayer(gameContainer, config as GamePlayerOptions)
}

if (urlParams.get('loader') === 'iso-local') {
    const controls = document.getElementById('controls')!

    const fileSelector = document.createElement('input')
    fileSelector.type = 'file'
    fileSelector.addEventListener('change', async (event: any) => {
        controls.removeChild(fileSelector)

        config = {
            ...baseOptions,
            fileLoader: new IsoFileLoader(event.target.files[0]),
        }
        gameContainer!.classList.add('notready')
        gameContainer!.addEventListener('click', start)
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

    config = {
        ...baseOptions,
        fileLoader: getFileLoader(),
    }
    gameContainer!.classList.add('notready')
    gameContainer!.addEventListener('click', start)
}
