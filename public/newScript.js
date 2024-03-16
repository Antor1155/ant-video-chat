const socket = io("/")
const peer = new Peer()
const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

const connectedPeers = {}

// handeling and adding video to the browser 
const videoGrid = document.getElementById("video-grid")
const myVideo = document.createElement("video")
myVideo.muted = true
myVideo.autoplay = true

videoGrid.append(myVideo)
getUserMedia({video: true, audio: true}, stream=>{
    myVideo.srcObject = stream
})

const friendVideo = document.createElement("video")
friendVideo.autoplay = true


peer.on("open", id => {
    console.log("my peer id: ", id)
    socket.emit("join-room", roomId, id)
})

socket.on("user-connected", friendId => {
    console.log("friend connected with id: ", friendId)

    // making a call to friend 
    makeStreamAndCall(friendId)
})

const makeStreamAndCall = friendId => {

    getUserMedia({ video: true, audio: true }, stream => {

        myVideo.srcObject = stream

        console.log("making stream to call: ", stream)

        // calling friend 
        const call = peer.call(friendId, stream)

        call.on("stream", remoteStream => {
            friendVideo.srcObject = remoteStream
            videoGrid.append(friendVideo)
        })

        call.on("close", ()=>{
            friendVideo.remove()
        })

    },
        err => {
            console.log(err)
        }

    )
}


// answering a call 
peer.on("call", call => {
    console.log("answering a call")

    getUserMedia({ video: true, audio: true }, stream => {
        myVideo.srcObject = stream

        call.answer(stream)

        call.on("stream", remoteStream => {
            friendVideo.srcObject = remoteStream
            videoGrid.append(friendVideo)
        }),

            call.on("close", () => {
                friendVideo.remove()
            })

        err => {
            console.log(err)
        }
    })
})


// when user disconnects 
