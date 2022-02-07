//arquivo com diversas funções que concatenam entre elas para formar a lógica de retorna o valor  dos empréstimos


function calculate() {

    //seção de variáveis internas que pegam o elemento  dentro do HTML para realizar os cálculos e lógicas

    // lembrando que o document.getElementById("") pode ser substituído por querySelector("")
    var amount = document.getElementById("amount"); // variável montante
    var apr = document.getElementById("apr"); // variável juros
    var years = document.getElementById("years"); // variável anos
    var paymentMonth = document.getElementById("paymentMonth"); // variável pagamento de parcela mensal
    var Payments = document.getElementById("payment"); // variável pagamento juros mensal
    var total = document.getElementById("total"); // variável total
    var totalinterest = document.getElementById("totalinterest"); // variável  emprestimo com juros

    // seção de utilização de variáveis internas covertendo o tipo de dado para realização dos cálculos financeiros de conversão para
    //equipara unidades de tempo e juros

    var principal = parseFloat(amount.value); // conversão do montante para número decimal
    var interest = (parseFloat(apr.value) / 100) / 12; // conversão dos juros por mês
    var Payments = parseFloat(years.value) * 12; // conversão por mês o tempo do pagamento



    var x = Math.pow(1 + interest, Payments); // formula juros adiciona ao montante que é 1
    var Monthly = (principal * x * interest) / (x - 1); // formula juros compostos 
    if (isFinite(Monthly)) {
        total.innerHTML = (Monthly * Payments).toFixed(2); //juros * tempo
        totalinterest.innerHTML = ((Monthly * Payments) - principal).toFixed(2); // juros * tempo - montante
        payment.innerHTML = (totalinterest.innerHTML / years.value).toFixed(2); //total de juros dividido por tempo = juros mensal
        paymentMonth.innerHTML = (total.innerHTML / years.value).toFixed(2); // total do montante + juros / tempo =parcela mensal

        //método save para salvar variaveis para guardar em localstorage do navegador e assim enviar ao backEnd
        save(amount.value, apr.value, years.value, paymentMonth.value);
        try {
            //se der certo enviar dados 
            getLenders(amount.value, apr.value, years.value, paymentMonth.value);

        } catch (e) {}
        // caso erro enviar ao gráfico

        chart(principal, interest, Monthly, Payments);

        //reinicar variaveis colocando resultado vazios para novos calculos
    } else {
        Payments.innerHTML = " ";
        total.innerHTML = " "
        totalinterest.innerHTML = " ";
        chart();

    }




}
// metodo salvar no localstorage e atribuir variaveis internas e nomeando dentro do navegador
function save(amount, apr, years, paymentMonth) {
    if (window.localStorage) {
        localStorage.loan_amount = amount;
        localStorage.loan_apr = apr;
        localStorage.loan_years = years;
        localStorage.loan_paymentMonth = paymentMonth;

    }
}
//evento navegador de ao carregar na janela  atribuir variaveis do HTML ao localstorage
window.onload = function() {
    if (window.localStorage && localStorage.loan_amount) {
        document.getElementById("amount").value = localStorage.loan_amount;
        document.getElementById("apr").value = localStorage.loan_apr;
        document.getElementById("years").value = localStorage.loan_years;
        document.getElementById("paymentMonth").value = localStorage.loan_paymentMonth;
    }
};

// evento com falha devido a exigir rotas e estrutura back end
function getLenders(amount, apr, years, paymentMonth) {
    if (!window.XMLHttpRequest) return;
    var ad = document.getElementById("Lenders");
    if (!ad) return;
    var url = "https://cors-anywhere.herokuapp.com/getLenders.php" + "?amt = " + encodeURIComponent(amount) + "&apr=" + encodeURIComponent(apr) +
        "&yrs=" + encodeURIComponent(years) +
        "&zip=" + encodeURIComponent(paymentMonth);


    // algoritimo da rota vazia 
    var req = new XMLHttpRequest();
    req.open("GET", url);
    req.send(null);


    // evento da rotae e se comunicadno com backEnd via JSON
    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            var response = req.responseText;
            var Lenders = JSON.parse(response);
            var list = "";
            for (var i = 0; i < Lenders.length; i++) {
                list += "<li><a href =  " + Lenders[i].url + " > " +
                    Lenders[i].name + "</a>";

            }
            ad.innerHTML = "<ul>" + list + "</ul>";
        }
    }
}

// função gráficoe desenhando no canvas
function chart(principal, interest, Monthly, Payments) {
    var graph = document.getElementById("graph");
    graph.width = graph.width;
    if (arguments.length == 0 || !graph.getContext) return;
    var g = graph.getContext("2d");
    var width = graph.width,
        height = graph.height;

    function paymentToX(n) {
        return n * width / Payments;
    }

    function amountToY(a) {
        return height - (a * height / (Monthly * Payments * 1.05));
    }
    g.moveTo(paymentToX(0), amountToY(0));
    g.lineTo(paymentToX(Payments), amountToY(Monthly * Payments));
    g.lineTo(paymentToX(Payments), amountToY(0));
    g.closePath();
    g.fillStyle = "red";
    g.fill();
    g.font = "bond 12 px sans-serif";
    g.fillText("total do empréstimo com juros", 20, 20);
    var equity = 0;
    g.beginPath();
    g.moveTo(paymentToX(0), amountToY(0));

    for (var p = 1; p <= Payments; p++) {
        var thisMonthsInterest = (principal - equity) * interest;
        equity += (Monthly - thisMonthsInterest);
        g.lineTo(paymentToX(p), amountToY(equity));
    };
    g.lineTo(paymentToX(Payments), amountToY(0));
    g.closePath();
    g.fillStyle = "green";
    g.fill();
    g.fillText("valor do empréstimo original", 20, 35);
    var bal = principal;
    g.beginPath();
    g.moveTo(paymentToX(0), amountToY(bal));
    for (var p = 1; p <= Payments; p++) {
        var thisMonthsInterest = bal * interest;
        bal -= (Monthly - thisMonthsInterest);
        g.lineTo(paymentToX(p), amountToY(bal));
    };
    g.lineWidth = 1;
    g.stroke();
    g.fillStyle = "#fff";
    g.fillText("saldo do empréstimo", 20, 50);
    g.textAlign = "auto";
    var y = amountToY(0);
    for (var monthly = 10; monthly <= Payments; monthly++) {
        var x = paymentToX(monthly * 1);
        g.fillRect(x - 0.5, y - 3, 1, 3);
        if (monthly == 10) g.fillText("meses", x, y);
        if (monthly % 100 == 0 && monthly * 10 !== Payments)
            g.fillText(String(monthly), x, y - 1);
    };
    g.textAlign = "right";
    g.textBaseline = "middle";
    var ticks = [Monthly * Payments, principal];
    var rightEdge = paymentToX(Payments);
    for (var i = 0; i < ticks.length; i++) {
        var y = amountToY(ticks[i]);
        g.fillRect(rightEdge - 3, y - 0.5, 3, 1);
        g.fillText(String(ticks[i].toFixed(0)),
            rightEdge - 5, y);

    }
}