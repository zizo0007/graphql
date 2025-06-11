


document.addEventListener('DOMContentLoaded', async () => {
  // Vérification de l'authentification
  const jwt = localStorage.getItem('jwt');
  if (!jwt) {
    window.location.href = 'index.html';
    return;
  }

  // Gestion de la déconnexion
  document.getElementById('exit').addEventListener('click', () => {
    localStorage.removeItem('jwt');
    window.location.href = 'index.html';
  });

  try {
    console.log('Chargement des données utilisateur et XP...');
    fetchUserData();
  } catch (error) {
    console.error('Erreur:', error);
    if (localStorage.getItem('jwt')) {
      localStorage.removeItem('jwt')
      window.location.href = 'index.html';
      return;
    }
    alert('Erreur de chargement des données');
  }
});
















const urlAutotification = "https://learn.zone01oujda.ma/api/auth/signin";
const urlGraph = "https://learn.zone01oujda.ma//api/graphql-engine/v1/graphql";



const userInfoAndProgress = document.createElement("div")
userInfoAndProgress.className = "userInfoAndProgress"

let infoUser;
let allTransactInfo;

const credentials = {
    username: '',
    password: ''
};




async function fetchUserData() {
    const jwt = localStorage.getItem('jwt');
    try {
        const response = await fetch(urlGraph, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({
                query: `
                query {
                    user {
                        id
                        login
                        attrs
                        totalUp
                        totalDown
                        transactions ( where: {eventId: {_eq: 41}}, order_by: {createdAt:asc}){
                            amount
                            type
                            createdAt
                        }
                    }
                    transaction{
                        id
                        type
                        amount 	
                        objectId 	
                        userId 	
                        createdAt 	
                        path
                    }
                }`
            })
        });

        if (!response.ok) {
            // Token invalide ou expiré
            localStorage.removeItem('jwt');
            window.location.href = 'index.html';
            return;
        }

        const data = await response.json();
        infoUser = data.data.user[0];
        console.log(infoUser.attrs);
        allTransactInfo = data.data.transaction;
        createProfilPageUser();
    } catch (error) {
        localStorage.removeItem('jwt');
        window.location.href = 'index.html';
        return;
    }
}

function updateWelcomeMessage() {
    const titrePage = document.getElementById("titrePage");
    if (infoUser && infoUser.attrs) {
        titrePage.innerHTML = `Bonjour, <span>${infoUser.attrs.firstName} ${infoUser.attrs.lastName}</span>`;
    }
}
async function createProfilPageUser(){
    if (infoUser){
        const contentPage = document.getElementById("personalnfo");
        exit()
        updateWelcomeMessage();
        TalentPersonalInfos(contentPage)
        createRadarChart(transactSkill());
        auditRatio() 
        xpProgressioninfo()
        

    }
}



function exit() {
    const exitDiv = document.getElementById("exit");
    exitDiv.innerHTML = ""; // Vide le conteneur avant d'ajouter le bouton
    const ExitBtn = document.createElement("button");
    ExitBtn.textContent = "se deconnecter";
    ExitBtn.onclick = function() {
        localStorage.removeItem('jwt');
        window.location.href = 'index.html';
    };
    exitDiv.appendChild(ExitBtn);
}

function TalentPersonalInfos(contentPage) {
    contentPage.innerHTML = `
        <div class="personalInfoContainer">
            <h3 class="infoHeader">Informations personnelles</h3>
            <div class="infoUser">Username: ${infoUser.login}</div>
            <div class="infoUser">Nom et prénom: ${infoUser.attrs.lastName} ${infoUser.attrs.firstName}</div>
            <div class="infoUser">Numéro de téléphone: ${infoUser.attrs.tel}</div>
            <div class="infoUser">Mail: ${infoUser.attrs.email}</div>
            <div class="infoUser">Ville: ${infoUser.attrs.city}</div>
            <div class="infoUser">Pays: ${infoUser.attrs.country}</div>
        </div>
    `;
}


function auditRatio() {
    const container = document.getElementById("auditRatio");
    container.innerHTML = "";

    const title = document.createElement("h3");
    title.className = "infoHeader";
    title.textContent = "Audit Ratio";
    container.appendChild(title);

    // Dimensions virtuelles pour le viewBox
    const width = 500;
    const height = 180;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.style.width = "100%";
    svg.style.height = "auto";
    svg.style.display = "block";
    svg.style.margin = "0 auto";

    // Calcul des largeurs des barres
    const totalDown = infoUser.totalDown / 1000000;
    const totalUp = infoUser.totalUp / 1000000;
    const maxBar = Math.max(totalDown, totalUp, 1); // éviter division par 0

    const barMaxWidth = width - 120;
    const downWidth = (totalDown / maxBar) * barMaxWidth;
    const upWidth = (totalUp / maxBar) * barMaxWidth;

    // Barres
    const rectDown = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rectDown.setAttribute("x", 100);
    rectDown.setAttribute("y", 40);
    rectDown.setAttribute("width", downWidth);
    rectDown.setAttribute("height", 40);
    rectDown.setAttribute("fill", "#e74c3c");

    const rectUp = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rectUp.setAttribute("x", 100);
    rectUp.setAttribute("y", 100);
    rectUp.setAttribute("width", upWidth);
    rectUp.setAttribute("height", 40);
    rectUp.setAttribute("fill", "#27ae60");

    // Labels centrés dans les rectangles, mais jamais hors de la barre
    function getTextX(barWidth) {
        // Si la barre est trop petite, centre le texte à la fin de la barre ou au début de la barre
        if (barWidth < 100) return 100 + barWidth + 50; // place le texte à droite de la barre
        return 100 + barWidth / 2;
    }

    const textDown = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textDown.setAttribute("x", getTextX(downWidth));
    textDown.setAttribute("y", 40 + 40 / 2 + 6);
    textDown.setAttribute("font-size", "16");
    textDown.setAttribute("fill", downWidth < 100 ? "#e74c3c" : "#fff");
    textDown.setAttribute("text-anchor", "middle");
    textDown.setAttribute("alignment-baseline", "middle");
    textDown.textContent = `Receive: ${totalDown.toFixed(2)} Mb`;

    const textUp = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textUp.setAttribute("x", getTextX(upWidth));
    textUp.setAttribute("y", 100 + 40 / 2 + 6);
    textUp.setAttribute("font-size", "16");
    textUp.setAttribute("fill", upWidth < 100 ? "#27ae60" : "#fff");
    textUp.setAttribute("text-anchor", "middle");
    textUp.setAttribute("alignment-baseline", "middle");
    textUp.textContent = `Done: ${totalUp.toFixed(2)} Mb`;

    svg.appendChild(rectDown);
    svg.appendChild(rectUp);
    svg.appendChild(textDown);
    svg.appendChild(textUp);

    container.appendChild(svg);
}

function createRadarChart(data) {
    const container = document.getElementById("talentSkills");
    container.innerHTML = "";

    const yourSkills = document.createElement("h3");
    yourSkills.textContent = "Your skills :";
    container.appendChild(yourSkills);

    // Dimensions virtuelles pour le viewBox
    const width = 500;
    const height = 350;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 30;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.style.width = "100%";
    svg.style.height = "auto";
    svg.style.display = "block";
    svg.style.margin = "0 auto";

    // Axes et labels
    data.forEach((value, index) => {
        const angle = (Math.PI * 2 * index) / data.length;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        // Axe
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", centerX);
        line.setAttribute("y1", centerY);
        line.setAttribute("x2", x);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "rgba(52, 152, 219, 0.5)");
        line.setAttribute("stroke-width", 2);
        svg.appendChild(line);

        // Label
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", x);
        label.setAttribute("y", y);
        label.setAttribute("fill", "#2c3e50");
        label.setAttribute("font-size", "14px");
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("alignment-baseline", "middle");
        label.textContent = `${data[index].type} : ${data[index].amount}`;
        svg.appendChild(label);
    });

    // Polygone des valeurs
    const polyPoints = data.map((value, index) => {
        const angle = (Math.PI * 2 * index) / data.length;
        const x = centerX + (radius * value.amount) / 100 * Math.cos(angle);
        const y = centerY + (radius * value.amount) / 100 * Math.sin(angle);
        return `${x},${y}`;
    });
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", polyPoints.join(" "));
    polygon.setAttribute("fill", "rgba(52, 152, 219, 0.3)");
    polygon.setAttribute("stroke", "#3498db");
    polygon.setAttribute("stroke-width", 2);
    svg.appendChild(polygon);

    container.appendChild(svg);
}
function xpProgressioninfo() {
    const xpContainer = document.getElementById("totalXP");
    const progressionContainer = document.getElementById("xpProgression");
    const transactions = transactionsEXP();
    let sommeOfAllValues = transactions.reduce((acc, curr) => acc + curr, 0);
    const maxAmount = Math.max(...transactions);
    const minAmount = Math.min(...transactions);
    const sum = sommeOfAllValues;
    const average = sum / transactions.length;
    const roundedAverage = Math.round(average);

    // Section Total XP
    xpContainer.innerHTML = `
        <h3 class="infoHeader">Total XP</h3>
        <div class="transactionInfo">${(sommeOfAllValues/1000).toFixed(2)} KB</div>
    `;

    // Section XP Progression (sans Total XP)
    progressionContainer.innerHTML = `
        <h3 class="infoHeader">XP Progression</h3>
        <div class="transactionInfo">Low Transaction: ${(minAmount/1000).toFixed(2)} KB</div>
        <div class="transactionInfo">Transactions: ${transactions.length}</div>
        <div class="transactionInfo">Transaction average: ${(roundedAverage/1000).toFixed(2)} KB</div>
        <div class="transactionInfo">Big Transaction ---> ${(maxAmount/1000).toFixed(2)} KB</div>
    `;
}




function transactionsEXP(){
    let array = [];
    for(let i = 0; i < infoUser.transactions.length-1; i++){
        if (infoUser.transactions[i].type ==="xp"){
            array.push(Number(infoUser.transactions[i].amount)) 

        }
    }
    return array
}


function transactSkill(){
    let obj1 ={
        amount: 0,
        createdAt: "",
        id: 0,
        objectId: 0,
        path: "",
        type: "",
        userId: 0
    }
    let obj = {
        go : obj1,
        js : obj1,
        algo : obj1,
        front : obj1,
        back : obj1,
        prog : obj1
    }
    for(let i = 0; i < allTransactInfo.length-1; i++){
        let transact = allTransactInfo[i].type;
        switch (transact){
            case "skill_prog":
                if (allTransactInfo[i].amount > obj.prog.amount){
                    obj.prog = allTransactInfo[i];
                }
                break
            
            case "skill_go":
                if (allTransactInfo[i].amount > obj.go.amount){
                    obj.go = allTransactInfo[i];
                }
                break

            case "skill_js":
                if (allTransactInfo[i].amount > obj.js.amount){
                    obj.js = allTransactInfo[i];
                }
                break

            case "skill_front-end":
                if (allTransactInfo[i].amount > obj.front.amount){
                    obj.front = allTransactInfo[i];
                }
                break

            case "skill_back-end":
                if (allTransactInfo[i].amount > obj.back.amount){
                    obj.back = allTransactInfo[i];
                }
                break

            case "skill_algo":
                if (allTransactInfo[i].amount > obj.algo.amount){
                    obj.algo = allTransactInfo[i];
                }
                break
            default:
                break
        }
    }
    let array = [];
    array.push(obj.algo);
    array.push(obj.back);
    array.push(obj.front);
    array.push(obj.go);
    array.push(obj.js);
    array.push(obj.prog);
    return array
}


