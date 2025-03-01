import { BUILD_VARS, createGamePlayer, GamePlayerOptions } from './index'
import { ArchiveOrgFileLoader, ListingJSONUrlFileLoader, GithubFileLoader, IsoFileLoader } from './loaders/filesLoader'

const urlParams = new URLSearchParams(window.location.search)
const gameContainer = document.getElementById('game')!
const debugContainer = document.getElementById('debug')
const controls = document.getElementById('controls')!
const baseOptions = {
    startScene: urlParams.get('scene') ?? undefined,
    debug: urlParams.has('debug') ? urlParams.get('debug') == 'true' : BUILD_VARS.debug,
    debugContainer: debugContainer,
    onExit: () => document.exitFullscreen(),
}

let config = {}
const start = () => {
    gameContainer.removeEventListener('click', start)
    gameContainer.classList.remove('notready')
    createGamePlayer(gameContainer, config as GamePlayerOptions)
}

if (urlParams.get('loader') === 'iso-local') {
    const fileSelector = document.createElement('input')
    fileSelector.type = 'file'
    fileSelector.addEventListener('change', async (event: any) => {
        controls.removeChild(fileSelector)

        config = {
            ...baseOptions,
            fileLoader: new IsoFileLoader(event.target.files[0]),
        }
        gameContainer.classList.add('notready')
        gameContainer.addEventListener('click', start)
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
            } else if (loader === 'listingjson') {
                return new ListingJSONUrlFileLoader(source)
            }
        }
        return new ListingJSONUrlFileLoader('https://iso.zagrajwreksia.pl/game-assets/reksioiskarbpiratow/listing.json')
    }

    config = {
        ...baseOptions,
        fileLoader: getFileLoader(),
    }
    gameContainer!.classList.add('notready')
    gameContainer!.addEventListener('click', start)
}

const enterFullscreen = document.querySelector('#enterFullscreen')!
enterFullscreen.addEventListener('click', () => {
    gameContainer!.requestFullscreen()
})
