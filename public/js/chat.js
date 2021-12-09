const socket = io()  //client side socket connection to send and recieve event specific objects


// socket.on('countUpdated', (count)=>{
//     console.log('The count has been updated' , count)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('clicked')
//     socket.emit('increment')
// })
// socket.on('message',(welcome)=>{
//     console.log(welcome)
// })
//================================================
//Elemeents
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $sendLocationButton =document.querySelector('#send-location')
const $sidebar = document.querySelector('#sidebar')

const $messages = document.querySelector('#messages')
//const $location = document.querySelector('#myLocation')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled') //disabled  = disabled

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value =''
        $messageFormInput.focus()
         if(error){
             //$messages.insertAdjacentHTML('beforeend', Mustache.render(messageTemplate, {message : error}))
             alert(error)
         }
         console.log('Message delivered')
    })
})

//Options
const {username, room}=Qs.parse(location.search,{ignoreQueryPrefix :true})

const autoscroll =()=>{   //fucntion used whenever a new message is added so created a function to inject wherever requried
    //new messag element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visble Height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    const scrollOffSet =  $messages.scrollTop + visibleHeight + 10

    if(containerHeight - newMessageHeight <= scrollOffSet){
        $messages.scrollTop=$messages.scrollHeight
    }

}

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username : message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation) {
        return alert('geo location is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled') //disabled  = disabled
    navigator.geolocation.getCurrentPosition((position)=>{
       
        console.log(position)
        socket.emit('sendLocation',{
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!!')
        })
    }) 
})

socket.on('locationMessage', (locationURL)=>{
    const html = Mustache.render(locationTemplate,{
        username :locationURL.username,
        locationURL:locationURL.url,
        createdAt : moment(locationURL.createdAt).format('h:mm a')
        
    })
    $messages.insertAdjacentHTML('beforeend', html)
    console.log(locationURL)
    autoscroll()
})

socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML=html
})

socket.emit('join',{username, room}, (error)=>{
    if(error){
        alert(error)
        location.href ='/'
    }

})