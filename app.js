function start(){
    console.log("started");
    chrome.desktopCapture.chooseDesktopMedia(["screen","window"], onApproved)
}

function onApproved(desktop_id){
    navigator.webkitGetUserMedia({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: desktop_id,
                minWidth: 1280,
                maxWidth: 1280,
                minHeight: 720,
                maxHeight: 720
            }
        }
    }, getStream, getError);

    function getStream(stream) {
        local_stream = stream;
        document.querySelector('video').src = URL.createObjectURL(stream);
    }
    function getError(error){
        console.log(error)
    }

}
document.querySelector('button').addEventListener("click",function(e){start()});
