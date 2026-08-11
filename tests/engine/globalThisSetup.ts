import { TextEncoder, TextDecoder } from 'util'

Object.assign(globalThis, {
    AudioContext: function() { },
    GainNode: function() { return { connect: () => { }, gain: { value: null } }; },
    TextDecoder,
    TextEncoder,
})
