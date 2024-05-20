// all countries who participated in EURO
var EUROcountries = [];
// all teams
d3.json("euro_cup_teams.json").then(function (data) {
  data.forEach((element) => {
    EUROcountries.push(element);
  });
});

console.log(EUROcountries);

const mapColors = d3.scaleOrdinal([
  "#2f4f4f",
  "#556b2f",
  "#7f0000",
  "#483d8b",
  "#008000",
  "#bc8f8f",
  "#b8860b",
  "#000080",
  "#32cd32",
  "#8fbc8f",
  "#8b008b",
  "#b03060",
  "#ff0000",
  "#ff8c00",
  "#00ff00",
  "#8a2be2",
  "#dc143c",
  "#A57164",
  "#1B1811",
  "#0000ff",
  "#adff2f",
  "#ff00ff",
  "#1e90ff",
  "#ffff54",
  "#dda0dd",
  "#90ee90",
  "#add8e6",
  "#ff1493",
  "#7b68ee",
  "#ffa07a",
  "#ffe4b5",
  "#E52B50",
  "#D2691E",
]);

// global variable with UK country name
var globalCountryName;

// width and height
var width = 1000;
var height = 800;

// margin and graph height and width
const margin = { top: 30, right: 30, bottom: 100, left: 100 };
const graphWidth = 500 - margin.left - margin.right;
const graphHeight = 450 - margin.top - margin.bottom;

// radii
var outerRadius = 75;
var innerRadius = outerRadius / 2;

// define map projection
var projection = d3
  .geoMercator()
  .center([13, 52])
  .translate([width / 2, height / 1.5])
  .scale([width / 1.5]);

// Define path generator
var path = d3.geoPath().projection(projection);

// Create SVG
var svg = d3
  .select("#container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "map");

// Load in GeoJSON data
d3.json("countries.json").then(function (json) {
  // Bind data and create one path per GeoJSON feature
  svg
    .selectAll("path")
    .data(json.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("stroke", "#736767")
    .attr("fill", "rgba(8, 81, 156, 0.6)")
    .on("click", onClick)
    .on("mouseover", onMouseOver)
    .on("mouseleave", onMouseLeave)
    .attr("fill", function (d, i) {
      var color = "rgb(233, 233, 233)";
      EUROcountries.forEach((element) => {
        if (element.Country == d.properties.name) {
          color = mapColors(i);
        }
      });
      return color;
    });
});

// pie and bar chart svg
var pieChartSvg = d3
  .select("#container")
  .append("svg")
  .attr("width", 600)
  .attr("height", 200)
  .attr("class", "pieChart");

var barChartSvg = d3
  .select("#container")
  .append("svg")
  .attr("width", 600)
  .attr("height", 500)
  .attr("class", "barChart");

// bar chart legend
var barChartLegend = barChartSvg
  .append("g")
  .attr("width", 700)
  .attr("height", 200)
  .attr("class", "barChartLegend");

// PIE CHART
var pieChartGroup = pieChartSvg
  .append("g")
  .attr("width", 300)
  .attr("height", 300)
  .attr("transform", "translate(75, 100)");

var pieChartGroupLegend = pieChartSvg
  .append("g")
  .attr("transform", `translate(200, 60)`);

const pieChartColors = d3.scaleOrdinal(["#0000ff", "#00ff00", "#ff0000"]);

const pieChartLegend = d3
  .legendColor()
  .shape("rect")
  .scale(pieChartColors)
  .title("Number of wins, draws and loses on EURO");

const pie = d3
  .pie()
  .sort(null)
  .value((d) => d.value);

const arcPath = d3.arc().outerRadius(outerRadius).innerRadius(innerRadius);

// BAR CHART
var barChartGroup = barChartSvg
  .append("g")
  .attr("width", graphWidth)
  .attr("height", graphHeight)
  .attr("transform", `translate(${margin.right + 35}, ${margin.top + 20})`);

// TIP
const tip = d3.tip().attr("class", "d3tip");

const pieChartTip = d3.tip().attr("class", "d3tip");

pieChartGroup.call(pieChartTip);

const barChartTip = d3.tip().attr("class", "d3tip");

barChartGroup.call(barChartTip);

svg.call(tip);

// AXIS
const xAxisGroup = barChartGroup
  .append("g")
  .attr("transform", `translate(0, ${graphHeight})`);
const yAxisGroup = barChartGroup.append("g");

const updatePieChart = (data, i) => {
  //console.log(data);
  //console.log(i);
  let pieData = [];
  pieData = getPieData(data, i);
  // domain
  pieChartColors.domain(pieData.map((d) => d.id));
  pieChartGroupLegend.call(pieChartLegend);

  // setting paths
  const paths = pieChartGroup.selectAll("path").data(pie(pieData));

  // deleting elements
  paths.exit().remove();
  // update current elements
  paths
    .attr("d", arcPath)
    .transition()
    .duration(750)
    .attrTween("d", arcTweenUpdate);
  // create elements for data provided
  //console.log(pieData);

  paths
    .enter()
    .append("path")
    .attr("class", "arc")
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .attr("fill", (d) => pieChartColors(d.data.id))
    .each(function (d) {
      this.trenutno = d;
    })
    .transition()
    .duration(1000)
    .attrTween("d", arcTweenEnter);

  pieChartGroup
    .selectAll("path")
    .on("mouseover", (d, i, n) => {
      pieChartTip.html((d) => {
        return `${d.value}`;
      });
      pieChartTip.show(i, d.target);
    })
    .on("mouseout", (d) => {
      pieChartTip.hide();
    });
};

function getPieData(data, i) {
  const newPieData = [];

  data.forEach((element) => {
    if (element.Team == i.properties.name) {
      newPieData.push({ id: "Win", value: element.Win });
      newPieData.push({ id: "Draw", value: element.Draw });
      newPieData.push({ id: "Loss", value: element.Loss });
    }
  });
  return newPieData;
}

function getCountryData(data, i) {
  const countryData = [];

  data.forEach((element) => {
    if (element.Team == i.properties.name) {
      countryData.push({
        name: "Participations",
        value: element.Participations,
      });
      countryData.push({ name: "Played", value: element.Played });
      countryData.push({ name: "Goal_For", value: element.Goal_For });
      countryData.push({ name: "Goal_Against", value: element.Goal_Against });
      countryData.push({ name: "Points", value: element.Points });
      countryData.push({ name: "Points/match", value: element.Pointsmatch });
    }
  });
  return countryData;
}

function handleRects(countryData) {
  barGraphTitle.text(`Country data on EURO`).style("font-size", 17);

  var colors = [
    "#fcebeb",
    "#fadede",
    "#fccfcf",
    "#fc9f9f",
    "#fa8787",
    "#fa5c5c",
    "#ff0000",
    "#9e0303",
  ];
  // Rectangles
  const rects = barChartGroup.selectAll("rect").data(countryData);

  rects.exit().remove();

  rects
    .attr("width", xScale.bandwidth)
    .attr("fill", (d) => {
      var value = Math.round(colorScale(d.value));
      return colors[value];
    })
    .attr("x", (d) => xScale(d.name))
    .transition()
    .duration(750)
    .attr("y", (d) => yScale(d.value))
    .attr("height", (d) => graphHeight - yScale(d.value));

  rects
    .enter()
    .append("rect")
    .attr("height", 0)
    .attr("fill", (d) => {
      var value = Math.round(colorScale(d.value));
      return colors[value];
    })
    .attr("stroke", "black")
    .attr("x", (d) => xScale(d.name))
    .attr("y", graphHeight)
    .transition()
    .duration(750)
    .attrTween("width", barWidthTween)
    .attr("y", (d) => yScale(d.value))
    .attr("height", (d) => graphHeight - yScale(d.value));

  // bar chart legend in form of rectangles
  var x = 10;
  for (var i = 0; i < 8; i++) {
    barChartLegend
      .append("rect")
      .attr("x", x)
      .attr("y", 120)
      .attr("width", 25)
      .attr("height", 25)
      .attr("stroke", "black")
      .attr("fill", colors[i]);
    x += 30;
  }

  barChartLegend
    .append("text")
    .attr("x", -75)
    .attr("y", 140)
    .text(`Manji broj`)
    .style("font-size", 18);

  barChartLegend
    .append("text")
    .attr("x", 250)
    .attr("y", 140)
    .text(`Veći broj`)
    .style("font-size", 18);
}

function addBarGraphTip() {
  barChartGroup
    .selectAll("rect")
    .on("mouseover", (d, i, n) => {
      barChartTip.html((d) => {
        return `${d.value}`;
      });
      barChartTip.show(i, d.target);
    })
    .on("mouseout", (d) => {
      barChartTip.hide();
    });
}

function addBarGraphAxes() {
  xAxisGroup.transition().duration(1500).call(xAxis);

  yAxisGroup.transition().duration(1500).call(yAxis);

  xAxisGroup.attr("font-size", 15);
  yAxisGroup.attr("font-size", 15);
}

function updateBarChart(data, i) {
  countryName.classList.add("prikazi");
  countryName.innerHTML = `${i.properties.name}`;

  const countryData = getCountryData(data, i);

  yScale.domain([0, d3.max(countryData, (d) => d.value)]);
  xScale.domain(countryData.map((d) => d.name));

  colorScale.domain([0, d3.max(countryData, (d) => d.value)]);
  handleRects(countryData);
  addBarGraphTip();
  addBarGraphAxes();
}

const colorScale = d3.scaleLinear().range([0, 6]);
// scales and axes for bar chart
const yScale = d3.scaleLinear().range([graphHeight, 0]);

const xScale = d3
  .scaleBand()
  .range([0, 500])
  .paddingInner(0.3)
  .paddingOuter(0.3);

const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale).ticks(10);

const countryName = document.querySelector(".countryName");

const barGraphTitle = barChartSvg
  .append("text")
  .attr("transform", "translate(150,15)");

function onClick(d, i) {
  var flag = false;

  d3.json("euro_cup_teams.json").then(function (data) {
    data.forEach((element) => {
      if (element.Country == i.properties.name) {
        if (element.Country == "United Kingdom") {
          if (flag == false) {
            chooseUKCountry(data, i);
            flag = true;
          }
        } else {
          updatePieChart(data, i);
          updateBarChart(data, i);
        }
      }
    });
  });
}

function chooseUKCountry(data, i) {
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
  closeButton.addEventListener("click", onClickClose);

  const countryButtons = Array.from(document.querySelectorAll(".button"));
  // console.log(countryButtons);
  // console.log(data[0]);

  for (let i = 0; i < countryButtons.length; i++) {
    //console.log(countryButtons[i]);
    var countryButton = countryButtons[i];
    countryButton.addEventListener("click", (event) => {
      var clickedCountryButton = event.target;
      onClickClose();

      data.forEach((element) => {
        if (element.Team == clickedCountryButton.textContent) {
          var myUKTeam = {
            properties: { name: element.Team },
          };

          updateBarChart(data, myUKTeam);
          updatePieChart(data, myUKTeam);
        }
      });
      //globalCountryName = clickedCountryButton.textContent;
    });
  }
}

function onClickClose() {
  let selectionBox = document.querySelector("#selectionBox");
  selectionBox.remove();
}

function onMouseOver(i, d) {
  EUROcountries.forEach((element) => {
    if (element.Country == d.properties.name) {
      if (element.Country == "United Kingdom") {
        tip.offset([20, 0]).html(function (i) {
          return `England<br>
								Northern Ireland<br>
							    Scotland<br>
								Wales`;
        });
      } else if (element.Country == "Norway") {
        tip.offset([500, 30]).html(function (i) {
          return `<h3>${d.properties.name}</h3>`;
        });
      } else if (element.Country == "Russia") {
        tip.offset([550, 350]).html(function (i) {
          return `<h3>${d.properties.name}</h3>`;
        });
      } else if (element.Country == "Netherlands") {
        tip.offset([0, 380]).html(function (i) {
          return `<h3>${d.properties.name}</h3>`;
        });
      } else if (element.Country == "Portugal") {
        tip.offset([0, 110]).html(function (i) {
          return `<h3>${d.properties.name}</h3>`;
        });
      } else if (element.Country == "France") {
        tip.offset([20, 30]).html(function (i) {
          return `<h3>${d.properties.name}</h3>`;
        });
      } else {
        tip.offset([0, 0]).html(function (i) {
          return `<h3>${d.properties.name}</h3>`;
        });
      }
      tip.show(d, i.target);
    }
  });
}

function onMouseLeave() {
  tip.hide();
}

function arcTweenUpdate(d) {
  var i = d3.interpolate(this.trenutno, d);

  this.trenutno = d;

  return function (t) {
    return arcPath(i(t));
  };
}

const arcTweenEnter = (d) => {
  var i = d3.interpolate(d.endAngle, d.startAngle);

  return function (t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

function barWidthTween(d) {
  var i = d3.interpolate(0, xScale.bandwidth());
  return function (t) {
    return i(t);
  };
}
