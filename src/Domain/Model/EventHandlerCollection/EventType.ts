enum EventType {
    Click = "click",
    Change = "change",
    AddFeature = "addfeature",
    SelectSingleFeature = "select",
    SelectByBox = "boxend",
    ModifyFeature = "modifyend",
    RotateFeature = "rotateend",
    TranslateFeature = "translateend",
    ScaleFeature = "scaleend",
    DrawStart = "drawstart", 
    DrawEnd = "drawend",
    PointerMove = "pointermove"
}

export default EventType;
