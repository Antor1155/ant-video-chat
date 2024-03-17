const socket = io("/")
const peer = new Peer()
const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

const connectedPeers = {}

// handeling and adding video to the browser 
const videoGrid = document.getElementById("video-grid")

const myVideo = document.getElementById("myVideo")
getUserMedia({ video: true, audio: true }, stream => {
    myVideo.srcObject = stream
})
myVideo.addEventListener("click", ()=>{
    const mainVideo = document.querySelector(".main")
    mainVideo.classList.remove("main")
    myVideo.classList.add("main")
})



function makeVideo(remoteStream, friendId) {

    if (!connectedPeers[friendId]) {

        const friendVideo = document.createElement("video")
        friendVideo.autoplay = true
        friendVideo.playsInline = true

        friendVideo.srcObject = remoteStream
        videoGrid.append(friendVideo)

        connectedPeers[friendId] = friendVideo

        friendVideo.addEventListener("click", ()=>{
            const mainVideo = document.querySelector(".main")
            mainVideo.classList.remove("main")

            friendVideo.classList.add("main")
        })
    }

}


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
            makeVideo(remoteStream, friendId)
        })

        call.on("close", () => {
            handleDisconnect(friendId)
        })

    },
        err => {
            console.log(err)
        }

    )
}


// answering a call 
peer.on("call", call => {
    const friendId = call.peer

    console.log("answering call of id: ", friendId)

    getUserMedia({ video: true, audio: true }, stream => {
        myVideo.srcObject = stream

        call.answer(stream)

        call.on("stream", remoteStream => {
            makeVideo(remoteStream, friendId)
        })

        call.on("close", () => {
            handleDisconnect(friendId)
        })

    }), err => {
        console.log(err)
    }
})


// when friend disconnects 
socket.on("user-disconnected", friendId => {
    console.log("user disconnected: ", friendId)
    handleDisconnect(friendId)
})


const handleDisconnect = (friendId) => {
    if (connectedPeers[friendId]) {
        connectedPeers[friendId].remove()
        delete connectedPeers[friendId]
    }
}


// button handles 

const cutCall = () => {
    const baseUrl = window.location.origin
    window.location = baseUrl
}

const invite = () => {

}
