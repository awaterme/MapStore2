const { PLAY, PAUSE, STOP, STATUS, SET_FRAMES, APPEND_FRAMES, FRAMES_LOADING, SET_CURRENT_FRAME, SELECT_PLAYBACK_RANGE, CHANGE_SETTING, UPDATE_METADATA } = require('../actions/playback');
const { RESET_CONTROLS } = require('../actions/controls');
const { set } = require('../utils/ImmutableUtils');

module.exports = (state = { status: STATUS.STOP, currentFrame: -1, settings: {
    timeStep: 1,
    stepUnit: "days",
    frameDuration: 2,
    following: true
}}, action) => {
    switch (action.type) {
        case PLAY: {
            return set(`status`, STATUS.PLAY, state);
        }
        case PAUSE: {
            return set(`status`, STATUS.PAUSE, state);
        }
        case STOP: {
            return set(`status`, STATUS.STOP,
                set('currentFrame', -1, state)
            );
        }
        case SET_FRAMES: {
            return set('frames', action.frames,
                set('currentFrame', -1, state)
            );
        }
        case FRAMES_LOADING: {
            return set('framesLoading', action.loading, state);
        }
        case APPEND_FRAMES: {
            return set('frames', [
                ...(state.frames || []),
                ...action.frames
            ], state);
        }
        case SET_CURRENT_FRAME: {
            return set('currentFrame', action.frame, state);
        }
        case SELECT_PLAYBACK_RANGE: {
            return set('playbackRange', action.range, state);
        }
        case CHANGE_SETTING: {
            return set(`settings[${action.name}]`, action.value, state);
        }
        case UPDATE_METADATA: {
            return set('metadata', { next: action.next, previous: action.previous, forTime: action.forTime}, state);
        }
        case RESET_CONTROLS: {
            return set('metadata', undefined, set('framesLoading', undefined, set('playbackRange', undefined, set('frames', undefined,
                       set('currentFrame', -1, set('status', "STOP", set('settings', {
                        timeStep: 1,
                        stepUnit: "days",
                        frameDuration: 5,
                        following: true
                       }, state)
            ))))));
        }
        default:
            return state;
    }
    return state;
};