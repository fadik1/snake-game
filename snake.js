let canvas = document.getElementById('canvas');

let ROWS = 30
let COLS = 50
let PIXEL = 10
let pixels = new Map()
let moveRight = ([t, l]) => [t, l + 1];
let moveLeft = ([t, l]) => [t, l - 1];
let moveUp = ([t, l]) => [t - 1, l ];
let moveDown = ([t, l]) => [t + 1, l ];

//--- rendering ---//

function initializeCanvas() {
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            let pixel = document.createElement('div');
            pixel.style.position = 'absolute';
            pixel.style.border = '1px solid grey';
            pixel.style.left = j * PIXEL +'px';
            pixel.style.top = i * PIXEL +'px';
            pixel.style.width = PIXEL +'px';
            pixel.style.height = PIXEL +'px';
            let key = toKey([i,j]);
            canvas.appendChild(pixel);
            pixels.set (key, pixel);
        }
    }

}

initializeCanvas();

function drawCanvas() {
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            let key = toKey([i,j]);
            let pixel = pixels.get(key);
            let background = 'white';
            if (key === currentFoodKey) {
                background = 'purple';
            } 
            else if (currentSnakeKeys.has(key)) {
                background = 'black';
            }
            pixel.style.background = background;
        }
    }
    // dump({
    //     currentSnake,
    //     foodKey: currentFoodKey,
    //     snakeKeys: Array.from(currentSnakeKeys),
    //     vacantKeys: Array.from(currentVacantKeys),
        
    // })
}

//--- game state ---//

let currentSnake;
let currentSnakeKeys;
let currentVacantKeys;
let currentFoodKey;
let currentDirection;
let directionQueue;



function step() {
    let head = currentSnake[currentSnake.length - 1];
    let nextDirection = currentDirection;
    while (directionQueue.length > 0) {
        let candidateDirection = directionQueue.shift();
        if (!areOpoosite(candidateDirection, currentDirection)) {
            nextDirection = candidateDirection;   
            break;     
        }
    }
    currentDirection = nextDirection;
    let nextHead = currentDirection(head);
    if(!checkValidHead(currentSnakeKeys, nextHead)) {
        stopGame(false);
        return;
    }
    pushHead(nextHead);
    if (toKey(nextHead) == currentFoodKey) {
        let nextFoodKey = spawnFood();
        if (nextFoodKey === null) {
            stopGame(true);
            return;
        }
        currentFoodKey = nextFoodKey;
    } 
    else {  
        popTail();
    }
    drawCanvas();
}

function pushHead(nextHead) {
    currentSnake.push(nextHead);
    let key = toKey(nextHead);
    currentVacantKeys.delete(key);
    currentSnakeKeys.add(key);
}

function popTail() {
    let tail = currentSnake.shift();
    let key = toKey(tail);
    currentVacantKeys.add(key);
    currentSnakeKeys.delete(key);
}

function spawnFood() {
    if (currentVacantKeys.size === 0) {
        return null;
    }
    let choice = Math.floor(Math.random() * currentVacantKeys.size);
    let i = 0;
    for (let key of currentVacantKeys) {
        if (i === choice) {
            return key;
        }
        i++;
    }
    throw Error('should never get here!');
}

//--- interaction---//

function stopGame(success) {
    canvas.style.borderColor = success ? 'green': 'red';
    clearInterval(gameInterval);

}

window.addEventListener('keydown', (e) => {
    // console.log(e.key)
    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) {
        return;
    }
    e.preventDefault();
    switch (e.key) {
        case "ArrowLeft":
        case 'A':
        case 'a':  
            directionQueue.push(moveLeft)
            break;
        case "ArrowRight":
        case 'D':
        case 'd':
            directionQueue.push(moveRight)
            break;
        case "ArrowUp":
        case 'W':
        case 'w':
            directionQueue.push(moveUp)
            break;
        case "ArrowDown":
        case 'S':
        case 's':
            directionQueue.push(moveDown)
            break;
        case 'r':
        case 'R':
            stopGame(false);
            startGame();
            break;
    }
})

function startGame() {
    directionQueue = [];
    currentDirection = moveRight;
    currentSnake = makeInitialSnake();
    currentSnakeKeys = new Set();
    currentVacantKeys = new Set();
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            currentVacantKeys.add(toKey([i, j]));
        }
    }
    for (let cell of currentSnake) {
        let key = toKey(cell);
        currentVacantKeys.delete(key);
        currentSnakeKeys.add(key);
    }
    currentFoodKey = spawnFood();

    canvas.style.borderColor = '';
    gameInterval = setInterval(step, 30);
    drawCanvas();
}

startGame();

//--- utilities ---//

function areOpoosite(dir1, dir2) {
    if (dir1 === moveLeft && dir2 === moveRight) {
        return true;
    }
    if (dir1 === moveRight && dir2 === moveLeft) {
        return true;
    }
    if (dir1 === moveUp && dir2 === moveDown) {
        return true;
    }
    if (dir1 === moveDown && dir2 === moveUp) {
        return true;
    }
    return false;
}

function checkValidHead(keys, cell) {
    let [top, left] = cell;
    if (top < 0 || left < 0) {
        return false;
    }
    if (top >= ROWS || left>=COLS) {
        return false;
    }
    if (keys.has(toKey(cell))) {
        return false;
    }
    return true;
}

function makeInitialSnake() {
    return  [
    [0,0], 
    [0,1],
    [0,2],
    [0,3],
    [0,4],
    [0,5]
    ];
}

function toKey ([top, left]) {
    return top + '_' + left;
}
function dump(obj) {
    document.getElementById('debug').innerText = 
    JSON.stringify(obj, null, 2)
    console.log(obj)
}


