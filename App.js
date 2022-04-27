/**
 * @flow
 */

import React from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { Asset } from "expo-asset";
import { Audio, Video } from "expo-av";
import * as Font from "expo-font";

import { MaterialCommunityIcons } from '@expo/vector-icons';

import Slider from "@react-native-community/slider";

class Icon {
    constructor(module, width, height) {
        this.module = module;
        this.width = width;
        this.height = height;
        Asset.fromModule(this.module).downloadAsync();
    }
}

class PlaylistItem {
    constructor(name, uri, isVideo) {
        this.name = name;
        this.uri = uri;
        this.isVideo = isVideo;
    }
}

const PLAYLIST = [
    new PlaylistItem(
        "WATER - DOC CHEATHAM & NICHOLAS PAYTON",
        "https://americanroutes.s3.amazonaws.com/shows/9801_01.mp3",
        false
    ),
    new PlaylistItem(
        "WATER - DOC CHEATHAM & NICHOLAS PAYTON",
        "https://americanroutes.s3.amazonaws.com/shows/9801_02.mp3",
        false
    ),
    new PlaylistItem(
        "WATER - DOC CHEATHAM & NICHOLAS PAYTON",
        "https://americanroutes.s3.amazonaws.com/shows/9802_01.mp3",
        false
    ),
    new PlaylistItem(
        "WATER - DOC CHEATHAM & NICHOLAS PAYTON",
        "https://americanroutes.s3.amazonaws.com/shows/9802_02.mp3",
        false
    ),
    new PlaylistItem(
        "Comfort Fit - “Sorry”",
        "https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Comfort_Fit_-_03_-_Sorry.mp3",
        false
    ),
    new PlaylistItem(
        "Big Buck Bunny",
        "http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
        true
    ),
    new PlaylistItem(
        "Mildred Bailey – “All Of Me”",
        "https://ia800304.us.archive.org/34/items/PaulWhitemanwithMildredBailey/PaulWhitemanwithMildredBailey-AllofMe.mp3",
        false
    ),
    new PlaylistItem(
        "Popeye - I don't scare",
        "https://ia800501.us.archive.org/11/items/popeye_i_dont_scare/popeye_i_dont_scare_512kb.mp4",
        true
    ),
    new PlaylistItem(
        "Podington Bear - “Rubber Robot”",
        "https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Podington_Bear_-_Rubber_Robot.mp3",
        false
    )
];

const LOOPING_TYPE_ALL = 0;
const LOOPING_TYPE_ONE = 1;

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");
const BACKGROUND_COLOR = "#FFF8ED";
const DISABLED_OPACITY = 0.5;
const FONT_SIZE = 14;
const LOADING_STRING = "... loading ...";
const BUFFERING_STRING = "...buffering...";
const RATE_SCALE = 3.0;
const VIDEO_CONTAINER_HEIGHT = (DEVICE_HEIGHT * 2.0) / 5.0 - FONT_SIZE * 2;

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.index = 0;
        this.isSeeking = false;
        this.shouldPlayAtEndOfSeek = false;
        this.playbackInstance = null;
        this.state = {
        showVideo: false,
        playbackInstanceName: LOADING_STRING,
        loopingType: LOOPING_TYPE_ALL,
        muted: false,
        playbackInstancePosition: null,
        playbackInstanceDuration: null,
        shouldPlay: false,
        isPlaying: false,
        isBuffering: false,
        isLoading: true,
        shouldCorrectPitch: true,
        volume: 1.0,
        rate: 1.0,
        videoWidth: DEVICE_WIDTH,
        videoHeight: VIDEO_CONTAINER_HEIGHT,
        poster: false,
        useNativeControls: false,
        fullscreen: false,
        throughEarpiece: false
        };
    }

    componentDidMount() {
        Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false
        });
    }

    async _loadNewPlaybackInstance(playing) {
        if (this.playbackInstance != null) {
        await this.playbackInstance.unloadAsync();
        // this.playbackInstance.setOnPlaybackStatusUpdate(null);
        this.playbackInstance = null;
        }

        const source = { uri: PLAYLIST[this.index].uri };
        const initialStatus = {
        shouldPlay: playing,
        rate: this.state.rate,
        shouldCorrectPitch: this.state.shouldCorrectPitch,
        volume: this.state.volume,
        isMuted: this.state.muted,
        isLooping: this.state.loopingType === LOOPING_TYPE_ONE
        // // UNCOMMENT THIS TO TEST THE OLD androidImplementation:
        // androidImplementation: 'MediaPlayer',
        };

        if (PLAYLIST[this.index].isVideo) {
            console.log(this._onPlaybackStatusUpdate);
            await this._video.loadAsync(source, initialStatus);
            // this._video.onPlaybackStatusUpdate(this._onPlaybackStatusUpdate);
            this.playbackInstance = this._video;
            const status = await this._video.getStatusAsync();
        } else {
            const { sound, status } = await Audio.Sound.createAsync(
                source,
                initialStatus,
                this._onPlaybackStatusUpdate
            );
            this.playbackInstance = sound;
        }

        this._updateScreenForLoading(false);
    }

    _mountVideo = component => {
        this._video = component;
        this._loadNewPlaybackInstance(false);
    };

    _updateScreenForLoading(isLoading) {
        if (isLoading) {
            this.setState({
                showVideo: false,
                isPlaying: false,
                playbackInstanceName: LOADING_STRING,
                playbackInstanceDuration: null,
                playbackInstancePosition: null,
                isLoading: true
            });
        } else {
            this.setState({
                playbackInstanceName: PLAYLIST[this.index].name,
                showVideo: PLAYLIST[this.index].isVideo,
                isLoading: false
            });
        }
    }

    _onPlaybackStatusUpdate = status => {
        if (status.isLoaded) {
            this.setState({
                playbackInstancePosition: status.positionMillis,
                playbackInstanceDuration: status.durationMillis,
                shouldPlay: status.shouldPlay,
                isPlaying: status.isPlaying,
                isBuffering: status.isBuffering,
                rate: status.rate,
                muted: status.isMuted,
                volume: status.volume,
                loopingType: status.isLooping ? LOOPING_TYPE_ONE : LOOPING_TYPE_ALL,
                shouldCorrectPitch: status.shouldCorrectPitch
            });
        if (status.didJustFinish && !status.isLooping) {
            this._advanceIndex(true);
            this._updatePlaybackInstanceForIndex(true);
        }
        } else {
            if (status.error) {
                console.log(`FATAL PLAYER ERROR: ${status.error}`);
            }
        }
    };

    _onLoadStart = () => {
        console.log(`ON LOAD START`);
    };

    _onLoad = status => {
        console.log(`ON LOAD : ${JSON.stringify(status)}`);
    };

    _onError = error => {
        console.log(`ON ERROR : ${error}`);
    };

    _onReadyForDisplay = event => {
        const widestHeight =
        (DEVICE_WIDTH * event.naturalSize.height) / event.naturalSize.width;
        if (widestHeight > VIDEO_CONTAINER_HEIGHT) {
            this.setState({
                videoWidth:
                (VIDEO_CONTAINER_HEIGHT * event.naturalSize.width) /
                event.naturalSize.height,
                videoHeight: VIDEO_CONTAINER_HEIGHT
            });
        } else {
            this.setState({
                videoWidth: DEVICE_WIDTH,
                videoHeight:
                (DEVICE_WIDTH * event.naturalSize.height) / event.naturalSize.width
            });
        }
    };

    _onFullscreenUpdate = event => {
        console.log(
        `FULLSCREEN UPDATE : ${JSON.stringify(event.fullscreenUpdate)}`
        );
    };

    _advanceIndex(forward) {
        this.index =
        (this.index + (forward ? 1 : PLAYLIST.length - 1)) % PLAYLIST.length;
    }

    async _updatePlaybackInstanceForIndex(playing) {
        this._updateScreenForLoading(true);

        this.setState({
            videoWidth: DEVICE_WIDTH,
            videoHeight: VIDEO_CONTAINER_HEIGHT
        });

        this._loadNewPlaybackInstance(playing);
    }

    _onPlayPausePressed = () => {
        if (this.playbackInstance != null) {
            if (this.state.isPlaying) {
                this.playbackInstance.pauseAsync();
            } else {
                this.playbackInstance.playAsync();
            }
        }
    };

    _onStopPressed = () => {
        if (this.playbackInstance != null) {
            this.playbackInstance.stopAsync();
        }
    };

    _onForwardPressed = () => {
        if (this.playbackInstance != null) {
            this._advanceIndex(true);
            this._updatePlaybackInstanceForIndex(this.state.shouldPlay);
        }
    };

    _onBackPressed = () => {
        if (this.playbackInstance != null) {
            this._advanceIndex(false);
            this._updatePlaybackInstanceForIndex(this.state.shouldPlay);
        }
    };

    _onMutePressed = () => {
        if (this.playbackInstance != null) {
            this.playbackInstance.setIsMutedAsync(!this.state.muted);
        }
    };

    _onLoopPressed = () => {
        if (this.playbackInstance != null) {
            this.playbackInstance.setIsLoopingAsync(
                this.state.loopingType !== LOOPING_TYPE_ONE
            );
        }
    };

    _onVolumeSliderValueChange = value => {
        if (this.playbackInstance != null) {
            this.playbackInstance.setVolumeAsync(value);
        }
    };

    _trySetRate = async (rate, shouldCorrectPitch) => {
        if (this.playbackInstance != null) {
            try {
                await this.playbackInstance.setRateAsync(rate, shouldCorrectPitch);
            } catch (error) {
                // Rate changing could not be performed, possibly because the client's Android API is too old.
            }
        }
    };

    _onRateSliderSlidingComplete = async value => {
        this._trySetRate(value * RATE_SCALE, this.state.shouldCorrectPitch);
    };

    _onPitchCorrectionPressed = async value => {
        this._trySetRate(this.state.rate, !this.state.shouldCorrectPitch);
    };

    _onSeekSliderValueChange = value => {
        if (this.playbackInstance != null && !this.isSeeking) {
            this.isSeeking = true;
            this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
            this.playbackInstance.pauseAsync();
        }
    };

    _onSeekSliderSlidingComplete = async value => {
        console.log(value);
        console.log(this.state.playbackInstanceDuration);
        if (this.playbackInstance != null) {
        this.isSeeking = false;
        const seekPosition = value * this.state.playbackInstanceDuration;
        if (this.shouldPlayAtEndOfSeek) {
            this.playbackInstance.playFromPositionAsync(seekPosition);
        } else {
            this.playbackInstance.setPositionAsync(seekPosition);
        }
        }
    };

    _onSkipBack15 = async value => {
        if (this.playbackInstance != null) {
        this.isSeeking = false;
        const seekPosition = this.state.playbackInstancePosition - (15 * 1000);
        if (this.shouldPlayAtEndOfSeek) {
            this.playbackInstance.playFromPositionAsync(seekPosition);
        } else {
            this.playbackInstance.setPositionAsync(seekPosition);
        }
        }
    };

    _onSkipForward15 = async value => {
        if (this.playbackInstance != null) {
        this.isSeeking = false;
        const seekPosition = this.state.playbackInstancePosition + (15 * 1000);
        if (this.shouldPlayAtEndOfSeek) {
            this.playbackInstance.playFromPositionAsync(seekPosition);
        } else {
            this.playbackInstance.setPositionAsync(seekPosition);
        }
        }
    };

    _onSkipBack60 = async value => {
        if (this.playbackInstance != null) {
        this.isSeeking = false;
        const seekPosition = this.state.playbackInstancePosition - (60 * 1000);
        if (this.shouldPlayAtEndOfSeek) {
            this.playbackInstance.playFromPositionAsync(seekPosition);
        } else {
            this.playbackInstance.setPositionAsync(seekPosition);
        }
        }
    };

    _onSkipForward60 = async value => {
        if (this.playbackInstance != null) {
        this.isSeeking = false;
        const seekPosition = this.state.playbackInstancePosition + (60 * 1000);
        if (this.shouldPlayAtEndOfSeek) {
            this.playbackInstance.playFromPositionAsync(seekPosition);
        } else {
            this.playbackInstance.setPositionAsync(seekPosition);
        }
        }
    };

    _getSeekSliderPosition() {
        if (this.playbackInstance != null &&
            this.state.playbackInstancePosition != null &&
            this.state.playbackInstanceDuration != null) 
        {
            return (
                this.state.playbackInstancePosition /
                this.state.playbackInstanceDuration
            );
        }
        return 0;
    }

    _getMMSSFromMillis(millis) {
        const totalSeconds = millis / 1000;
        const seconds = Math.floor(totalSeconds % 60);
        const minutes = Math.floor(totalSeconds / 60);

        const padWithZero = number => {
        const string = number.toString();
        if (number < 10) {
            return "0" + string;
        }
            return string;
        };
        return padWithZero(minutes) + ":" + padWithZero(seconds);
    }

    _getTimestamp() {
        if (
            this.playbackInstance != null &&
            this.state.playbackInstancePosition != null &&
            this.state.playbackInstanceDuration != null
        ) {
            return `${this._getMMSSFromMillis(
                this.state.playbackInstancePosition
            )} / ${this._getMMSSFromMillis(this.state.playbackInstanceDuration)}`;
        }
        return "";
    }

    _onPosterPressed = () => {
        this.setState({ poster: !this.state.poster });
    };

    _onUseNativeControlsPressed = () => {
        this.setState({ useNativeControls: !this.state.useNativeControls });
    };

    _onFullscreenPressed = () => {
        try {
        this._video.presentFullscreenPlayer();
        } catch (error) {
        console.log(error.toString());
        }
    };

    _onSpeakerPressed = () => {
        this.setState(
        state => {
            return { throughEarpiece: !state.throughEarpiece };
        },
        ({ throughEarpiece }) =>
            Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
            playThroughEarpieceAndroid: throughEarpiece
            })
        );
    };

    render() {
        return (
        <View style={styles.container}>
            <View />
            <View style={styles.nameContainer}>
            <Text style={styles.text}>
                {this.state.playbackInstanceName}
            </Text>
            </View>
            <View style={styles.space} />
            <View style={styles.videoContainer}>
            <Video
                ref={this._mountVideo}
                style={[
                styles.video,
                {
                    opacity: this.state.showVideo ? 1.0 : 0.0,
                    width: this.state.videoWidth,
                    height: this.state.videoHeight
                }
                ]}
                resizeMode={Video.RESIZE_MODE_CONTAIN}
                onPlaybackStatusUpdate={this._onPlaybackStatusUpdate}
                onLoadStart={this._onLoadStart}
                onLoad={this._onLoad}
                onError={this._onError}
                onFullscreenUpdate={this._onFullscreenUpdate}
                onReadyForDisplay={this._onReadyForDisplay}
                useNativeControls={this.state.useNativeControls}
            />
            </View>
            <View
            style={[
                styles.playbackContainer,
                {
                opacity: this.state.isLoading ? DISABLED_OPACITY : 1.0
                }
            ]}
            >
            <Slider
                style={styles.playbackSlider}
                value={this._getSeekSliderPosition()}
                onValueChange={this._onSeekSliderValueChange}
                onSlidingComplete={this._onSeekSliderSlidingComplete}
                disabled={this.state.isLoading}
            />
            <View style={styles.timestampRow}>
                <Text
                style={[
                    styles.text,
                    styles.buffering
                ]}
                >
                    {this.state.isBuffering ? BUFFERING_STRING : ""}
                </Text>
                <Text
                style={[
                    styles.text,
                    styles.timestamp
                ]}
                >
                    {this._getTimestamp()}
                </Text>
            </View>
            </View>
        {/* Control Button Row */}
            <View
                style={[
                    styles.buttonsContainerBase,
                    styles.buttonsContainerTopRow,
                    {
                        opacity: this.state.isLoading ? DISABLED_OPACITY : 1.0
                    }]}
                >
                <TouchableHighlight
                    underlayColor={BACKGROUND_COLOR}
                    style={styles.wrapper}
                    onPress={this._onSkipBack60}
                    disabled={this.state.isLoading}
                >
                    <MaterialCommunityIcons name="rewind-60" style={styles.controlButton} />
                </TouchableHighlight>
                <TouchableHighlight
                    underlayColor={BACKGROUND_COLOR}
                    style={styles.wrapper}
                    onPress={this._onSkipBack15}
                    disabled={this.state.isLoading}
                >
                    <MaterialCommunityIcons name="rewind-15" style={styles.controlButton} />
                </TouchableHighlight>
                <TouchableHighlight
                    underlayColor={BACKGROUND_COLOR}
                    style={styles.wrapper}
                    onPress={this._onBackPressed}
                    disabled={this.state.isLoading}
                >
                    <MaterialCommunityIcons name="skip-previous" style={styles.controlButton} />
                </TouchableHighlight>
                <TouchableHighlight
                    underlayColor={BACKGROUND_COLOR}
                    style={styles.wrapper}
                    onPress={this._onPlayPausePressed}
                    disabled={this.state.isLoading}
                >
                    <MaterialCommunityIcons 
                    style={styles.controlButton}
                    name={
                        this.state.isPlaying
                        ? 'pause'
                        : 'play'
                    }
                    />
                </TouchableHighlight>
                <TouchableHighlight
                    underlayColor={BACKGROUND_COLOR}
                    style={styles.wrapper}
                    onPress={this._onStopPressed}
                    disabled={this.state.isLoading}
                >
                    <MaterialCommunityIcons name="stop" style={styles.controlButton} />
                </TouchableHighlight>
                <TouchableHighlight
                    underlayColor={BACKGROUND_COLOR}
                    style={styles.wrapper}
                    onPress={this._onForwardPressed}
                    disabled={this.state.isLoading}
                >
                    <MaterialCommunityIcons name="skip-next" style={styles.controlButton} />
                </TouchableHighlight>
                <TouchableHighlight
                    underlayColor={BACKGROUND_COLOR}
                    style={styles.wrapper}
                    onPress={this._onSkipForward15}
                    disabled={this.state.isLoading}
                >
                    <MaterialCommunityIcons name="fast-forward-15" style={styles.controlButton} />
                </TouchableHighlight>
                <TouchableHighlight
                    underlayColor={BACKGROUND_COLOR}
                    style={styles.wrapper}
                    onPress={this._onSkipForward60}
                    disabled={this.state.isLoading}
                >
                    <MaterialCommunityIcons name="fast-forward-60" style={styles.controlButton} />
                </TouchableHighlight>
            </View>
        {/* Volume */}
            <View style={[ styles.buttonsContainerBase, styles.buttonsContainerMiddleRow ]}>
                <View style={styles.volumeContainer}>
                    <TouchableHighlight
                        underlayColor={BACKGROUND_COLOR}
                        style={styles.wrapper}
                        onPress={this._onMutePressed}
                    >
                    <MaterialCommunityIcons
                        style={styles.controlButton}
                        name={
                            this.state.muted
                                ? 'volume-off'
                                : 'volume-high'
                        }
                    />
                    </TouchableHighlight>
                    <Slider
                        style={styles.volumeSlider}
                        value={1}
                        onValueChange={this._onVolumeSliderValueChange}
                    />
                </View>
                <TouchableHighlight
                    underlayColor={BACKGROUND_COLOR}
                    style={styles.wrapper}
                    onPress={this._onLoopPressed}
                >
                    <MaterialCommunityIcons
                        style={styles.controlButton}
                        name={
                            this.state.loopingType == 0
                                ? 'repeat'
                                : 'repeat-once'
                        }
                    />
                </TouchableHighlight>
            </View>
        {/* Rate */}
            <View style={[ styles.buttonsContainerBase, styles.buttonsContainerBottomRow ]}>
                <TouchableHighlight
                    underlayColor={BACKGROUND_COLOR}
                    style={styles.wrapper}
                    onPress={() => this._trySetRate(1.0, this.state.shouldCorrectPitch)}
                >
                    <View style={styles.button}>
                    <Text
                        style={styles.text}
                    >
                        {this.state.rate == '1' ? " Rate:" : "Reset: "}
                    </Text>
                    </View>
                </TouchableHighlight>
            <Slider
                style={styles.rateSlider}
                value={this.state.rate / RATE_SCALE}
                onSlidingComplete={this._onRateSliderSlidingComplete}
            />
            <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                style={styles.wrapper}
                onPress={this._onPitchCorrectionPressed}
            >
                <View style={styles.button}>
                <Text
                    style={styles.text}
                >
                    PC: {this.state.shouldCorrectPitch ? "yes" : "no "}
                </Text>
                </View>
            </TouchableHighlight>
            <TouchableHighlight
                onPress={this._onSpeakerPressed}
                underlayColor={BACKGROUND_COLOR}
                visible={false}
                disabled={true}
            >
                <MaterialCommunityIcons
                    style={styles.controlButton}
                    name={
                        this.state.throughEarpiece
                        ? 'ear-hearing'
                        : 'ear-hearing-off'
                    }
                    
                />
            </TouchableHighlight>
            </View>
            <View />
            {this.state.showVideo ? (
            <View>
                <View
                style={[
                    styles.buttonsContainerBase,
                    styles.buttonsContainerTextRow
                ]}
                >
                <View />
                <TouchableHighlight
                    underlayColor={BACKGROUND_COLOR}
                    style={styles.wrapper}
                    onPress={this._onPosterPressed}
                >
                    <View style={styles.button}>
                    <Text
                        style={[styles.text, { fontFamily: "cutive-mono-regular" }]}
                    >
                        Poster: {this.state.poster ? "yes" : "no"}
                    </Text>
                    </View>
                </TouchableHighlight>
                <View />
                <TouchableHighlight
                    underlayColor={BACKGROUND_COLOR}
                    style={styles.wrapper}
                    onPress={this._onFullscreenPressed}
                >
                    <View style={styles.button}>
                    <Text
                        style={[styles.text, { fontFamily: "cutive-mono-regular" }]}
                    >
                        Fullscreen
                    </Text>
                    </View>
                </TouchableHighlight>
                <View />
                </View>
                <View style={styles.space} />
                <View
                style={[
                    styles.buttonsContainerBase,
                    styles.buttonsContainerTextRow
                ]}
                >
                <View />
                <TouchableHighlight
                    underlayColor={BACKGROUND_COLOR}
                    style={styles.wrapper}
                    onPress={this._onUseNativeControlsPressed}
                >
                    <View style={styles.button}>
                    <Text
                        style={[styles.text, { fontFamily: "cutive-mono-regular" }]}
                    >
                        Native Controls:{" "}
                        {this.state.useNativeControls ? "yes" : "no"}
                    </Text>
                    </View>
                </TouchableHighlight>
                <View />
                </View>
            </View>
            ) : null}
        </View>
        );
    }
}

const styles = StyleSheet.create({
    emptyContainer: {
        alignSelf: "stretch",
        backgroundColor: BACKGROUND_COLOR
    },
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "stretch",
        backgroundColor: BACKGROUND_COLOR
    },
    wrapper: {},
    nameContainer: {
        height: FONT_SIZE
    },
    space: {
        height: FONT_SIZE
    },
    videoContainer: {
        height: VIDEO_CONTAINER_HEIGHT
    },
    video: {
        maxWidth: DEVICE_WIDTH
    },
    playbackContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "stretch",
        //minHeight: ICON_THUMB_1.height * 2.0,
        //maxHeight: ICON_THUMB_1.height * 2.0
    },
    playbackSlider: {
        alignSelf: "stretch"
    },
    timestampRow: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        alignSelf: "stretch",
        minHeight: FONT_SIZE
    },
    text: {
        fontSize: FONT_SIZE,
        minHeight: FONT_SIZE
    },
    controlText: {
        fontSize: 20,
        fontWeight: "bold",
        paddingRight: 5,
        paddingLeft: 5
    },
    controlButton: {
        fontSize: 42,
        paddingRight: 1,
        paddingLeft: 1
    },
    buffering: {
        textAlign: "left",
        paddingLeft: 20
    },
    timestamp: {
        textAlign: "right",
        paddingRight: 20
    },
    button: {
        backgroundColor: BACKGROUND_COLOR
    },
    buttonsContainerBase: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    buttonsContainerTopRow: {
        //maxHeight: ICON_PLAY_BUTTON.height,
        minWidth: DEVICE_WIDTH / 1.1,
        maxWidth: DEVICE_WIDTH / 1.1
    },
    buttonsContainerMiddleRow: {
        //maxHeight: ICON_MUTED_BUTTON.height,
        alignSelf: "stretch",
        paddingRight: 20
    },
    volumeContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minWidth: DEVICE_WIDTH / 1.3,
        maxWidth: DEVICE_WIDTH / 1.3
    },
    volumeSlider: {
        width: DEVICE_WIDTH / 1.2 - 50//ICON_MUTED_BUTTON.width
    },
    buttonsContainerBottomRow: {
        //maxHeight: ICON_THUMB_1.height,
        alignSelf: "stretch",
        paddingRight: 20,
        paddingLeft: 20
    },
    rateSlider: {
        width: DEVICE_WIDTH / 2.0
    },
    buttonsContainerTextRow: {
        maxHeight: FONT_SIZE,
        alignItems: "center",
        paddingRight: 20,
        paddingLeft: 20,
        minWidth: DEVICE_WIDTH,
        maxWidth: DEVICE_WIDTH
    }
});
