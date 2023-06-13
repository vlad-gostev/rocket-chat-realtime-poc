import './App.css';
import { RealTimeAPI } from "rocket.chat.realtime.api.rxjs";
import { useEffect, useState } from 'react';

// Provide, URL to the Rocket.Chat's Realtime API.
const realTimeAPI =  new RealTimeAPI("ws://localhost:3000/websocket");

realTimeAPI.connectToServer()

// Responds "pong" to the "ping" message sent by the Realtime API. To keep the connection alive.
realTimeAPI.keepAlive().subscribe();

const auth = realTimeAPI.login('vladgost', '111111');

function App() {
  const [eventLog, setEventLog] = useState([])

  const setCurrentUserSubscriptions = (currentUserId) => {
    const subSubscription = realTimeAPI.getSubscription('stream-notify-user', currentUserId + '/subscriptions-changed', false)
    subSubscription.subscribe((data) => {
      console.log(data.fields.args)
      setEventLog(state => state.concat([
        'Room ' + data.fields.args[0] + ' "' +
        data.fields.args[1].name + 
        '" - new message: ' + data.fields.args[1].alert + ', ' +
        ' unread: ' + data.fields.args[1].unread + ', ' +
        ' hidden: ' + !data.fields.args[1].open + ', ' +
        ' favorite: ' + data.fields.args[1].f
      ]))
    })

    const loggedSubscription = realTimeAPI.getSubscription('stream-notify-logged', 'user-status', false)
    loggedSubscription.subscribe((data) => {
      setEventLog(state => state.concat([
        'User "' + data.fields.args[0][1] + 
        '" - status: ' + data.fields.args[0][2]
      ]))
    })

    const roomSubscription = realTimeAPI.getSubscription('stream-notify-user', currentUserId + '/rooms-changed', false)
    roomSubscription.subscribe((data) => {
      setEventLog(state => state.concat([
        'New message ' + data.fields.args[1].lastMessage.md[0].value[0].value
      ]))
    })
  }

  const handleLoginMessage = (data) => { 
    if (data?.msg === 'result') { 
      setCurrentUserSubscriptions(data.result.id) 
    } 
  }

  useEffect(() => {
    auth.subscribe(
      handleLoginMessage,
      (err) => console.log(err),
      () => console.log('completed')
    );
  }, [])

  // const handleClick = () => {
  //   console.log('click')
  //   console.log(realTimeAPI)
  //   realTimeAPI.callMethod('sendMessage', {
  //     "rid": "9dpSRkdCJ2fDx9ZhgivpsY6KpBvvaduc5m",
  //     "msg": "Hello World!"
  //   })
  // }

  return (
    <div className="App">
      <ul>
        {eventLog.map((log, i) => (
          <li key={i}>{log}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
