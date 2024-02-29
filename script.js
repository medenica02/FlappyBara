//promenljive za board
let board;
// biramo ove dimenzije zbog dimenzija slike pozadine
let boardWidth=360;
let boardHeight=640;
// koristimo za crtanje po canvasu
let context;

//promenljive za zivotinju
let capyWidth= 34; //nasa slika je sirina/visina=408/228=17/12
let capyHeight= 24; //pa skaliramo

//posmatramo koordinatni sistem gde je koord pocetak u gornjem
//levom uglu, capy se nalazi na polovini ekrana pa je pola visine
// i otprilike na 1/8 sirine slike zato idu ovi koef. za deljenje
let capyX=boardWidth/8;
let capyY=boardHeight/2;

let capyImg;

//objekat capy sa sva 4 parametra potrebna za crtanje
let capy={
    x: capyX,
    y: capyY,
    width: capyWidth,
    height: capyHeight
}

//promeljive za cevi
//imamo vise cevi pa stavimo ih u niz
let pipeArray=[];
let pipeWidth=64; //sirina/visina= 384/3072 = 1/8
let pipeHeight=512;

//zato sto nam treba da cev pocinje u gornjem desnom uglu, nalaze se van canvasa pa treba da se pomeraju u levo
let pipeX=boardWidth;
let pipeY=0;


let topPipeImg;
let bottomPipeImg;

//fizika
//treba nam promenljiva koja ce da pomogne u smanjenju pozicije pipe-a na ekranu
//tj koja ce da pomera pipe u levo, u sustini brzina pomeranja u levo
let velocityX= -2;
//da napravimo capy da skace, brzina skakanja
let velocityY=0;

//treba nam i gravitacija da spusti capy dole
let gravity=0.4;


let gameOver=false;
let score=0;


window.onload= function(){
    board=document.getElementById("board");
    board.height=boardHeight;
    board.width=boardWidth;
    // koristi se za crtanje na tabli
    context=board.getContext("2d");


    //cratnje capy
    // context.fillStyle="green";
    // context.fillRect(capy.x,capy.y,capy.width,capy.height);

    //ucitavanje slike za capy
    capyImg=new Image();
    capyImg.src="./capybara.jpg";
    capyImg.onload=function(){
        context.drawImage(capyImg,capy.x,capy.y,capy.width,capy.height);
    }

    topPipeImg=new Image();
    topPipeImg.src="./toppipe.png";
    // topPipeImg.onload=function(){
    //     context.drawImage(topPipeImg,pipeX,pipeY,pipeWidth,pipeHeight);
    // }

    bottomPipeImg=new Image();
    bottomPipeImg.src="./bottompipe.png";
   
    requestAnimationFrame(update);
    setInterval(placePipes,1500) //na svakih 1.5 sekundi ce se stvoriti pipe

    //dodajemo da na klik capy skace
    document.addEventListener("keydown",moveCapy);

}
//funkcija za ponovno iscrtavanje canvasa
function update(){

    requestAnimationFrame(update);
    //ukoliko je gameOver true treba da prestanemo da crtamo 
    if(gameOver){
        return;
    }
    context.clearRect(0,0,board.width,board.height);

    //crtanje capy opet
    //pre nego sto nacrtamo capy moramo da updatujemo y koord zbog kreanja
    velocityY += gravity;
    // capy.y +=velocityY;
    //posto nemamo granicu gornju i donju dokle sme capy da leti onda treba da je napravimo
    capy.y= Math.max(capy.y + velocityY,0);
    context.drawImage(capyImg,capy.x,capy.y,capy.width,capy.height);

    if(capy.y>board.height){
        gameOver=true;
    }

    //pipes
    for(let i=0;i<pipeArray.length;i++){
        let pipe=pipeArray[i];
        //moramo svakom pipe-u da promenimo x koord.
        pipe.x += velocityX;
        context.drawImage(pipe.img,pipe.x,pipe.y,pipe.width,pipe.height);

        //treba da uvecamo score svaki put kad prode kroz pipe
        if(!pipe.passed && capy.x > pipe.x + pipe.width){
            score+=0.5;
            pipe.passed=true;
        }

        if(detectCollision(capy,pipe)){
            gameOver=true;
        }
    }

    //moramo da brisemo neke pipe-ove zbog memorije niza puci ce
    //kad god imamo u nizu neke pipe-ove i njegova x pozicija je ispala iz ekrana
    while(pipeArray.length>0 && pipeArray[0].x < -pipeWidth){
        pipeArray.shift(); //uklanja prvi element iz niza 
    }

    //score
    context.fillStyle="white";
    context.font="45px sans-serif";
    //tekst
    context.fillText(score,5,45);

    //da ispise game over ako se zabodemo u cev
    if(gameOver){
        context.fillText("Game over!",5,90);
    }
}

function placePipes(){

    if(gameOver){
        return;
    }

    //kako bi promenili da ne budu uvek pipe-ovi na istom mestu
    let pipeRandomY=pipeY-pipeHeight/4 - Math.random()*(pipeHeight/2);
    let betweenSpace=boardHeight/4;
    //objekat gornji pajp
    let topPipe={
        img: topPipeImg,
        x: pipeX,
        y: pipeRandomY,
        width: pipeWidth,
        height: pipeHeight,
        //da li je capy prosao ovaj pipe
        passed: false
    }

    pipeArray.push(topPipe);


    let bottomPipe={
        img: bottomPipeImg,
        x:pipeX,
        y:pipeRandomY + pipeHeight + betweenSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }

    pipeArray.push(bottomPipe);
}


function moveCapy(e){
    //ako je kliknut space ili strelica na gore onda pravimo da capy skace
    if(e.code=="Space" || e.code=="ArrowUp"){
        //treba nam negativan broj za pomeraj jer ako idemo na gore smanjuju se koord
        //a ako idemo dole se povecavaju
        velocityY=-6;

        //restartovanje igre
        //stavljamo sve parametre koji se menjaju na pocetnu vrednost
        if(gameOver){
            capy.y=capyY;
            pipeArray=[];
            score=0;
            gameOver=false;
        }
    }
}

//detektuje da li su se "dodirnula" dva objekta
function detectCollision(a,b){

    return a.x < b.x + b.width && 
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
}
