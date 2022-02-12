
import './App.css';
import Peer from 'peerjs';
import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { Button, Typography, Grid, Container, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

function App() {
  const [peer, setPeer] = useState(new Peer())
  const [peerId, setPeerId] = useState('')
  const [conn, setConn] = useState({})
  const [opponentId, setOpponentId] = useState(null)
  const [turn, setTurn] = useState(true)
  const [openGameBoard, setOpenGameBoard] = useState(false)
  const [board, setBoard] = useState([
   ['','','','','','','','','',''],['','','','','','','','','',''],['','','','','','','','','',''],['','','','','','','','','',''],['','','','','','','','','',''],['','','','','','','','','','']
  ])

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

  useEffect(()=>{
    if(Object.keys(conn).length==0)
    {
      return
    }
    begin()
  },[conn])

  useEffect(()=>{
    if(opponentId===null)
    {
      return
    }
    console.log("open game board")
    setOpenGameBoard(true)
  },[opponentId])


  function begin(){
    console.log('begins')
    conn.on('open', function(){
      conn.send({'id':peerId})
      conn.on('data', function(data){
        console.log(data)
        if(data.hasOwnProperty('id')){
          setOpponentId(data['id'])
        }
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
    });
   
  }

  function joinGame(){
    let oppId = prompt("Enter Room ID:")
    var conn = peer.connect(oppId);
    setConn(conn) 
    setTurn(false)
  }

  function sendData(){
    conn.send({'random': peerId})
  }



  return (
    <div className="App">
      {!openGameBoard && <header className="App-header">
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

        </Box>
       </Box>
      </header>}

      {openGameBoard && 
      <Container >
          <Box sx={{ width: '100%', pl:10, pt:10 }}>
            {
              [...Array(6).keys()].map((item, i) => (
                <Grid container  key={i} sx={{width:'100%'}}>
                {
                  [...Array(10).keys()].map((item, j) => (
                    <Grid item >
                    <Box className="grid-item" key={j} sx={{
                      height:'30px',
                      width:'40px'
                    }}>
                        {board[i][j]}
                    </Box>
                    </Grid>
                )) 
                }
                </Grid>
              ))
            }
            <Grid container   sx={{width:'100%', }}>
            {
            
            [...Array(10).keys()].map((item, j) => (
              <Grid item >
              <Box  key={j} sx={{
                      fontSize:'30px',
                      padding:'9px',
                      textAlign:'center'
                    }} >
                      <Button variant='contained' color="primary">

                 <ArrowUpwardIcon/>
                      </Button>
              </Box>
              </Grid>
              
          ))}
          </Grid>
          
          </Box>
      </Container>

      }
    </div>
  );
}

export default App;
