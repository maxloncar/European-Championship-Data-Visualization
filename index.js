//all countries who participated in EURO
var EUROcountries = [];
//all teams
d3.json("euro_cup_teams.json").then(function (data) {
    data.forEach(element => {
        EUROcountries.push(element);
    })
})

// width and height
var width = 900;
var height = 700;

// define map projection
var projection = d3.geoMercator()
    .center([13, 52])
    .translate([width / 2, height / 1.5])
    .scale([width / 1.5]);

//Define path generator
var path = d3.geoPath()
    .projection(projection);

//Create SVG
var svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

//Load in GeoJSON data
d3.json("countries.json").then(function (json) {
    //Bind data and create one path per GeoJSON feature
    svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "rgba(8, 81, 156, 0.2)")
        .attr("fill", "rgba(255, 0, 0, 0.7)")
        .on("click", onClick)
        .on("mouseover", onMouseOver)
        .on("mouseleave", onMouseLeave);
});

const tip = d3.tip().attr('class', 'd3tip')
svg.call(tip);

function onClick(i, d) {
    d3.json("euro_cup_teams.json").then(function (data) {
        data.forEach(element => {
            if (element.Country == d.properties.name) {
                console.log(element.Team);
                if (element.Country == "United Kingdom") {
                    chooseUKCountry(element);
                }
            }
        })
    })
}

function chooseUKCountry(element) {
    let selectionContainer = document.querySelector("#selection");
    selectionContainer.innerHTML = `
        <div id="selectionBox">
            <div id="header">
                <h3>Choose UK country you want to display: </h3>
                <input class="delete_button" type="image" src="img/button-delete.png">
            </div>
            <div id="buttons">
                <button class="button england" type="button"><span>England</span></button>
                <button class="button northern_ireland" type="button"><span>Northern Ireland</span></button>
                <button class="button scotland" type="button"><span>Scotland</span></button>
                <button class="button wales" type="button"><span>Wales</span></button>
            </div>
        </div>
    `;
    let closeButton = document.querySelector(".delete_button");
    closeButton.addEventListener('click', onClickClose);
}

function onClickClose(event) {
    let selectionBox = document.querySelector("#selectionBox");
    selectionBox.remove();
}

function onMouseOver(i, d) {
    EUROcountries.forEach(element => {
        if (element.Country == d.properties.name) {
            if (element.Country == "United Kingdom") {
                tip.offset([20, 0])
                    .html(function (i) {
                        return `England<br>
								Northern Ireland<br>
							    Scotland<br>
								Wales`;
                    })
            } else if (element.Country == "Norway") {
                tip.offset([500, 30])
                    .html(function (i) {
                        return `<h3>${d.properties.name}</h3>`;
                    })
            } else if (element.Country == "Russia") {
                tip.offset([550, 350])
                    .html(function (i) {
                        return `<h3>${d.properties.name}</h3>`;
                    })
            } else if (element.Country == "Netherlands") {
                tip.offset([0, 380])
                    .html(function (i) {
                        return `<h3>${d.properties.name}</h3>`;
                    })
            } else if (element.Country == "Portugal") {
                tip.offset([0, 110])
                    .html(function (i) {
                        return `<h3>${d.properties.name}</h3>`;
                    })
            } else if (element.Country == "France") {
                tip.offset([20, 30])
                    .html(function (i) {
                        return `<h3>${d.properties.name}</h3>`;
                    })
            } else {
                tip.offset([0, 0])
                    .html(function (i) {
                        return `<h3>${d.properties.name}</h3>`;
                    })
            }
            tip.show(d, i.target);
        }
    });
}

function onMouseLeave() {
    tip.hide();
}