import './App.css';

function main() {
  const ws = new WebSocket('ws://localhost:3000');

  ws.onmessage = function(event) {
    console.log(event);

    ws.send(JSON.stringify({hello: 'world'}));
  }

  console.log('1223124');
  const canvas = document.querySelector('canvas');
  console.log(canvas);
}

main();
