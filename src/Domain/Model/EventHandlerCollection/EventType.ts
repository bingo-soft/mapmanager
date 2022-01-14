enum EventType {
    Click = "click",
    PointerMove = "pointermove",
    KeyDown = "keydown",
    Change = "change",
    MoveEnd = "moveend",
    AddFeature = "addfeature",
    SelectSingleFeature = "select",
    SelectByBox = "boxend",
    ModifyFeature = "modifyend",
    RotateFeature = "rotateend",
    TranslateFeature = "translateend",
    ScaleFeature = "scaleend",
    DrawStart = "drawstart", 
    DrawEnd = "drawend",
    SourceChange = "sourcechange",
    TileLoadStart = "tileloadstart",
    TileLoadError = "tileloaderror",
    TileLoadEnd = "tileloadend"
}

export default EventType;
