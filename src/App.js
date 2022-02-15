
import './App.css';
import Peer from 'peerjs';
import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { Button, Typography, Grid, Container } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { CompareSharp } from '@mui/icons-material';

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
  const [result, setResult] = useState(null)
  const [resultMessage, setResultMessage] = useState('')
  const [recentRow, setRecentRow] = useState(-1)
  const [recentCol, setRecentCol] = useState(-1)
  

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
    console.log("open game board", opponentId)
    setOpenGameBoard(true)
  },[opponentId])

  useEffect(()=>{
    console.log(result)
    if(result===null){
      return
    }
    if(result === peerId)
    {
      setResultMessage('YOU WON, refresh and reconnect to play again')
      return
    }
    setResultMessage("OPPONENT WON, refresh and reconnect to play again")
  },[result])

  function begin(){
    console.log('begins')
    conn.on('open', function(){
      conn.send({'id':peerId})
      conn.on('data', function(data){
        if(data.hasOwnProperty('move')&&data.hasOwnProperty('id')){
          setTurn(true)
          console.log(data['move'], data['id'])
          updateGridWithMove(data['move'],data['id'])
          return 
        }
        if(data.hasOwnProperty('id')){
          console.log(data['id'])
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

  function makeMove(event, index){
    if(!turn)
    {
      return;
    }
    conn.send({'move':index, 'id':peerId})
    updateGridWithMove(index, peerId)
    setTurn(false)
  }


  function updateGridWithMove(index, id){
    
    const col = index
    let newBoard = [...board]
    for (let i = 5; i >= 0; i--) {
      if(newBoard[i][col]==='')
      {
        newBoard[i][col]=id;
        setRecentRow(i)
        setRecentCol(col)
        setBoard(newBoard)
        console.log(newBoard)
        if(checkWin(newBoard, i,col, id)){
          console.log(id)
          setResult(id)
        }
        return;
      }
    }
    return;
  }

  function checkWin(gameBoard, r, c, id){
    const c_min = 0, c_max = 9
    var  count=0
    for (let i = 0; i <=5; i++) {
      if(gameBoard[i][c]===id)
      {
        count++;
        if(count===4)
        {
          return true;
        }
      } else {
        count=0
      }
      
    }
    count = 0 
    for (let i = 0; i <=9; i++) {
      if(gameBoard[r][i]===id)
      {
        count++;
        if(count===4)
        {
          return true;
        }
      } else {
        count=0
      }
      
    }
    count = 0
    const diff = r-c
    for (let i = 0; i <=5 ; i++) {
      var j = i-diff
      if(j<c_min || j>c_max)
      {
        continue;
      }
      if(gameBoard[i][j]===id)
      {
        count++;
        if(count===4)
        {
          return true
        }
      }
      else{
        count=0;
      }
    }

    count =0
    const sum = r+c
    for (let i = 0; i <=5 ; i++) {
       j = sum-i
      if(j<c_min || j>c_max)
      {
        continue;
      }
      if(gameBoard[i][j]===id)
      {
        count++;
        if(count===4)
        {
          return true
        }
      }
      else{
        count=0;
      }
    }
    return false;
  }

  function displayValue(i,j){
    if(board[i][j]===peerId)
    {
      return 'X'
    } if(board[i][j]==opponentId)
    {
      return 'O'
    }
    return ''
  }

  function displayMove(){
    if(turn)
    {
      return "Your move:"
    } else {
      return "Waiting for opponent to move:"
    }
  }



  return (
    <div className="App">
      {!openGameBoard && <header className="App-header">
        <Box sx={{
          py:5
        }}>
         <Typography variant="h1" component="div" gutterBottom>
          TIC-STACK-TOE
         </Typography>
         <Typography variant="caption" component="div" gutterBottom>
          v0.0.2
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
            {displayMove()}
            {
              [...Array(6).keys()].map((item, i) => (
                <Grid container  key={i} sx={{width:'100%'}}>
                {
                  [...Array(10).keys()].map((item, j) => (
                    <Grid item key={j} >
                    <Box className="grid-item" style={{color: recentRow === i && recentCol ===j ? "red" : ""}} key={j} sx={{
                      height:'30px',
                      width:'40px'
                    }}>
                        {displayValue(i,j)}
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
              <Grid item key={j}>
              <Box  key={j} sx={{
                      fontSize:'30px',
                      padding:'9px',
                      textAlign:'center'
                    }} >
                      <Button variant='contained' color="primary" onClick={(event)=>{makeMove(event,j)}}>

                          <ArrowUpwardIcon/>
                      </Button>
              </Box>
              </Grid>
              
          ))}
          </Grid>
          {resultMessage}
          </Box>
      </Container>

      }
    </div>
  );
}

export default App;
