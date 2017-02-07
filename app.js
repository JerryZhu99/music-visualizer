
function resize(){
    $("#canvas").outerHeight($(window).height()-$("#canvas").offset().top- Math.abs($("#canvas").outerHeight(true) - $("#canvas").outerHeight()));
}
$(document).ready(function(){
    resize();
    $(window).on("resize", function(){
        resize();
    });
});

var recording = false;
var local_stream = null;
function toggle(){
    if(!recording){
        recording = true;
        console.log("started");
        chrome.desktopCapture.chooseDesktopMedia(["screen","audio"], onApproved);
    }else{
        recording = false;
        if(local_stream)
            local_stream.stop();
        local_stream=null;
    }
}

function onApproved(streamId){
    navigator.webkitGetUserMedia({
        audio: {
            mandatory: {
                chromeMediaSource: 'system',
                chromeMediaSourceId: streamId,
            }
        },
        video:  {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: streamId,
                minWidth: 1,
                maxWidth: 1,
                minHeight: 1,
                maxHeight: 1
            }
        }
    }, getStream, getError);

    function getStream(stream) {
        local_stream = stream;
        //    var a = document.querySelector('video')
        //    a.src = URL.createObjectURL(stream);
        //    a.play();
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var analyser = audioCtx.createAnalyser();
        source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        analyser.fftSize = 2048;
        var bufferLength = analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        // Get a canvas defined with ID "oscilloscope"
        var canvas = document.getElementById("canvas");
        var canvasCtx = canvas.getContext("2d");

        // draw an oscilloscope of the current audio source

        function draw() {
            var WIDTH= canvas.width;
            var HEIGHT = canvas.height;
            drawVisual = requestAnimationFrame(draw);

            analyser.getByteFrequencyData(dataArray);

            canvasCtx.fillStyle = 'rgb(0, 0, 0)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            var barWidth = (WIDTH / bufferLength) * 7.5;
            var barHeight;
            var x = 0;

            for(var i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i]/256.0 * HEIGHT;

                canvasCtx.fillStyle = 'rgb(0,0,' + (dataArray[i]) + ')';
                canvasCtx.fillRect(x,HEIGHT,barWidth,-barHeight);

                x += barWidth;
            }
        };

        draw();

    }
    function getError(error){
        console.log(error)
    }

}
document.querySelector('button').addEventListener("click",function(e){toggle()});
document.querySelector('canvas').addEventListener('click', function() {
    chrome.app.window.current().fullscreen();
});
toggle();
