export interface Call {
    CallId: string;
    type: string;
    CallSignal:
        | 'PERMIT-CALL-AUDIO'
        | 'PERMIT-CALL-VIDEO'
        | 'ACCEPT-PERMIT-AUDIO'
        | 'ACCEPT-PERMIT-VIDEO'
        | 'DECLINE-PERMIT-AUDIO'
        | 'DECLINE-PERMIT-VIDEO'
        | 'INIT-CALL-AUDIO'
        | 'INIT-CALL-VIDEO'
        | 'END-CALL-AUDIO'
        | 'END-CALL-VIDEO'
        | 'CALL-BUSY'
        | 'CALL-ASSIGNED'
        | 'CALL-STARTED'
        | 'VIDEO-JOIN-CALL-TIMEOUT'
        | 'AUDIO-JOIN-CALL-TIMEOUT'
        | 'VIDEO-JOIN-CALL-ACCEPT'
        | 'AUDIO-JOIN-CALL-ACCEPT'
        | 'VIDEO-JOIN-CALL-REJECT'
        | 'AUDIO-JOIN-CALL-REJECT'
        | 'MISS-CALL-AUDIO'
        | 'MISS-CALL-VIDEO'
        | 'CALL-END';
    WidgetDeviceId?: string;
    ProxyDeviceId?: string;
    sender?: string;
    msg?: string;
    widgetToken?: string;
    CallType?: string;
}
export interface JoinRoom {
    type: string;
    roomUrl: string;
    WidgetDeviceId: string;
    CallId: string;
    ProxyDeviceId: string;
    CallType: string;
}

export enum VideoEvents {
    CameraError = 'cameraError',
    AvatarChanged = 'avatarChanged',
    AudioAvailabilityChanged = 'audioAvailabilityChanged',
    AudioMuteStatusChanged = 'audioMuteStatusChanged',
    EndpointTextMessageReceived = 'endpointTextMessageReceived',
    MicError = 'micError',
    ScreenSharingStatusChanged = 'screenSharingStatusChanged',
    DominantSpeakerChanged = 'dominantSpeakerChanged',
    TileViewChanged = 'tileViewChanged',
    IncomingMessage = 'incomingMessage',
    OutgoingMessage = 'outgoingMessage',
    DisplayNameChange = 'displayNameChange',
    DeviceListChanged = 'deviceListChanged',
    EmailChange = 'emailChange',
    FeedbackSubmitted = 'feedbackSubmitted',
    FilmstripDisplayChanged = 'filmstripDisplayChanged',
    ParticipantJoined = 'participantJoined',
    ParticipantKickedOut = 'participantKickedOut',
    ParticipantLeft = 'participantLeft',
    ParticipantRoleChanged = 'participantRoleChanged',
    PasswordRequired = 'passwordRequired',
    VideoConferenceJoined = 'videoConferenceJoined',
    VideoConferenceLeft = 'videoConferenceLeft',
    VideoAvailabilityChanged = 'videoAvailabilityChanged',
    VideoMuteStatusChanged = 'videoMuteStatusChanged',
    EeadyToClose = 'readyToClose',
    SubjectChange = 'subjectChange',
    SuspendDetected = 'suspendDetected',
}

export interface CallCredentials {
    jwt: string;
    room: string;
}

export enum CallStorageKeys {
    CallRequestChannel = 'CallRequestChannel',
    CallPhone91DeviceId = 'CallPhone91DeviceId',
    CallSessionId = 'CallSessionId',
}
