
import './App.css';
import Peer from 'peerjs';
import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { Button, Typography } from '@mui/material';
function App() {
  const [peer, setPeer] = useState(new Peer())
  const [peerId, setPeerId] = useState('')
  const [conn, setConn] = useState({})
  const [opponentId, setOpponentId] = useState('')
  const [turn, setTurn] = useState(true)

  function initializePeer(){
    peer.on('open',function(id){
      setPeerId(id)
      console.log(id)
    })
    peer.on('error', function(error){
      alert(error)
    })
  }

  useEffect(()=>{
    initializePeer()
  },[])


  function initConnection(conn){
    conn.on('open', function(){
      conn.on('data', function(data){
        console.log(data)
      })
    })
    conn.on('error', function(error){
      console.log(error)
    })
  }
  

  function startGame(){
    alert("Game Id:  "+peerId)
    peer.on('connection', function(conn) { 
      setConn(conn)
     initConnection(conn)
    });
   
  }

  function joinGame(){
    let oppId = prompt("Enter Room ID:")
    var conn = peer.connect(oppId);
    setConn(conn)
    initConnection(conn)
  }

  function sendData(){
    console.log(conn.open)
    conn.send({'random': peerId})
    conn.on('open', function() {
      console.log(conn)
     })

     conn.on('error', function(error){
       console.log(error)
     })
  }

  return (
    <div className="App">
      <header className="App-header">
        <Box sx={{
          py:6
        }}>
         <Typography variant="h1" component="div" gutterBottom>
        TIC-STACK-TOE
      </Typography>
        </Box>
       <Box sx={{
         display:"flex",
         justifyContent:"space-around"
       }}>
         <Box sx={{
           px:2
         }}>

        <Button variant='contained' onClick={startGame}>
          Start Game
        </Button>
         </Box>
        <Box sx={{
          px:2
        }}>

        <Button variant="contained" onClick={joinGame}>
          Join Game
        </Button>

        <Button variant="contained" onClick={sendData}>
          Test
        </Button>
        </Box>
       </Box>
      </header>
    </div>
  );
}

export default App;
