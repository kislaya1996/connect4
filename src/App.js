
import './App.css';
import Peer from 'peerjs';
import { useEffect, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { Button, Typography, Grid, Container } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { CompareSharp } from '@mui/icons-material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

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
  const [showRoomId, setShowRoomId] = useState(false)
  const [showRematchOption, setShowRematchOption] = useState(false)
  const [showRematchAcceptance, setShowRematchAcceptance] = useState(false)

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
      setResultMessage('YOU WON')
      return
    }
    setResultMessage("OPPONENT WON")
  },[result])

  function begin(){
    console.log('begins')
    conn.on('open', function(){
      conn.send({'id':peerId})
      conn.on('data', function(data){
        console.log(data)
        if(data==="rematch")
        {
          setShowRematchAcceptance(true)
          return
        }
        if(data==="rematch-accept")
        {
          setTurn(false)
          resetEverything()
          return 
        }
      
        if(data.hasOwnProperty('move')&&data.hasOwnProperty('id')){
          
          setTurn(true)
          updateGridWithMove(data['move'],data['id'])
          return 
        }
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
    // alert("Game Id:  "+peerId)
    setShowRoomId(true)
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
    // console.log(board,"kjgjk")
    const col = index
    for (let i = 5; i >= 0; i--) {
      if(board[i][col]==='')
      {
        board[i][col]=id;
        setRecentRow(i)
        setRecentCol(col)
        setBoard(board)
        // console.log(board)
        if(checkWin(board, i,col, id)){
          console.log(id)
          setResult(id)
          setShowRematchOption(true)
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

  function requestRematch(){
    conn.send('rematch')
  }

  function acceptRematchRequest(){
    conn.send('rematch-accept')
    setTurn(true)
    resetEverything()
  }

  function rejectRematchRequest(){
    //
  }

  function resetEverything(){
    console.log('reset called')
    const newBoard = [
      ['','','','','','','','','',''],['','','','','','','','','',''],['','','','','','','','','',''],['','','','','','','','','',''],['','','','','','','','','',''],['','','','','','','','','','']
     ]
    setBoard([...newBoard])
     setResult(null)
     setResultMessage('')
     setRecentRow(-1)
     setRecentCol(-1)
     setShowRematchOption(false)
     setShowRematchAcceptance(false)
     begin()
  }

  useEffect(()=>{
    console.log(board)
  },[board])



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
      {showRoomId &&  <Box sx={{
         display:"flex",
         justifyContent:"space-around",
         pt:10
       }}>

        <Typography variant="subtitle1" component="div" gutterBottom sx={{pr:5, pt:2}}>
          {`Room Id: ${peerId}`}
         </Typography>
         <IconButton color='primary' size="medium" onClick={() => {navigator.clipboard.writeText(peerId)}}>
          <ContentCopyIcon fontSize="inherit" />
          </IconButton>
        </Box>}
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
              {`-------Click buttons below to make move------`}
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
          {
            showRematchOption &&
            
            <Button variant="contained" onClick={()=>{requestRematch()}}>
          Rematch?
        </Button>
          }
          {
            showRematchAcceptance && 
            <Box>
              {`Opponent Requested Rematch`}
            <Button variant="contained" onClick={()=>{acceptRematchRequest()}}>
         Accept
       </Button>
       <Button variant="contained" onClick={()=>{rejectRematchRequest()}}>
         Reject
       </Button>
            </Box>
        }
          </Box>
      </Container>

      }
    </div>
  );
}

export default App;
