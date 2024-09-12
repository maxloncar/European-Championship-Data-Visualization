"use strict";

// all countries/teams who participated in UEFA EURO
let euroCupTeams = [];

// fetching JSON file euro_cup_teams
d3.json("euro_cup_teams.json").then((teams) => {
  teams.forEach((team) => {
    euroCupTeams.push(team);
  });
});

// map width and height
const width = 1000;
const height = 800;

// margin, width and height for the graphs
const margin = { top: 30, right: 30, bottom: 100, left: 100 };
const graphWidth = 500 - margin.left - margin.right;
const graphHeight = 450 - margin.top - margin.bottom;

// radii
const outerRadius = 75;
const innerRadius = outerRadius / 2;

// define map projection
const projection = d3
  .geoMercator()
  .center([13, 52])
  .translate([width / 2, height / 1.5])
  .scale([width / 1.5]);

// define path generator
const path = d3.geoPath().projection(projection);

// create an SVG with d3
const svg = d3
  .select("#container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "map");

// linear color shades from white to blue
const mapColorShades = d3
  .scaleLinear()
  .domain([0, 10])
  .range(["white", "blue"]);

// load in GeoJSON data
d3.json("countries.json").then(function (json) {
  // bind data and create one path per GeoJSON feature
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
      let mapColor = "rgb(233, 233, 233)"; // default color for countries that didn't participate in EURO
      euroCupTeams.forEach((element) => {
        if (element.Country == d.properties.name) {
          mapColor = mapColorShades(element.Participations);
        }
      });
      return mapColor;
    });
});

// PIE CHART WITH A LEGEND
const pieChartGroup = d3
  .select("#graphs")
  .append("svg")
  .attr("class", "piechart");

const pieChartSvg = pieChartGroup.append("g").attr("class", "piechart__svg");

const pieChartLegend = pieChartGroup
  .append("g")
  .attr("class", "piechart__legend");

// pie chart colors for each arc
const pieChartColors = d3.scaleOrdinal([
  "rgb(0, 0, 255)",
  "rgb(255, 255, 255)",
  "rgb(204, 204, 255)",
]);

// creating a new color legend
const pieChartColorLegend = d3.legendColor().scale(pieChartColors);

// generating a pie for the given array of pie data without sorting
// it returns an array of objects representing each arc of the pie
const pie = d3
  .pie()
  .sort(null)
  .value((d) => d.value);

// creating a new arc generator with the specified inner and outer radius
const arcPath = d3.arc().outerRadius(outerRadius).innerRadius(innerRadius);

/**
 * Class representing an ArcTweenUpdater.
 * This class is responsible for updating the arcs in the pie chart.
 * @class
 */
class ArcTweenUpdater {
  constructor() {
    // default constructor
  }

  /**
   * Updates the arc path based on the new data.
   * @param {object} data - The new data for the arc.
   * @returns {function} - The arc path function.
   */
  arcTweenUpdate(data) {
    let interpolate = d3.interpolate(this.data, data);
    this.data = data;

    return (t) => arcPath(interpolate(t));
  }
}

const arcTweenUpdate = new ArcTweenUpdater().arcTweenUpdate;

// BAR CHART WITH A LEGEND
const barChartSvg = d3
  .select("#graphs")
  .append("svg")
  .attr("class", "barchart");

const barChartLegend = barChartSvg
  .append("g")
  .attr("class", "barchart__legend");

const barChartGroup = barChartSvg
  .append("g")
  .attr("width", graphWidth)
  .attr("height", graphHeight)
  .attr("transform", `translate(${margin.right + 35}, ${margin.top + 20})`);

// D3TIP
// tooltip initialization
const tip = d3.tip().attr("class", "d3tip");

// invoking the tooltip in the context of visualizations
pieChartSvg.call(tip);
barChartSvg.call(tip);
svg.call(tip);

// AXISES
const barChartAxisX = barChartGroup
  .append("g")
  .attr("transform", `translate(0, ${graphHeight})`);
const barChartAxisY = barChartGroup.append("g");

// function that returns data for the clicked country map
const getCountryData = function (data, feature) {
  // country data needed for both pie and bar chart
  const countryData = {
    pieChartData: [],
    barChartData: [],
  };

  data.forEach((element) => {
    if (element.Team == feature.properties.name) {
      // pie chart data
      countryData.pieChartData.push({
        id: `Wins: ${element.Win}`,
        value: element.Win,
      });
      countryData.pieChartData.push({
        id: `Draws: ${element.Draw}`,
        value: element.Draw,
      });
      countryData.pieChartData.push({
        id: `Losses: ${element.Loss}`,
        value: element.Loss,
      });

      // bar chart data
      countryData.barChartData.push({
        name: "Participations",
        value: element.Participations,
      });
      countryData.barChartData.push({ name: "Matches", value: element.Played });
      countryData.barChartData.push({ name: "Points", value: element.Points });
      countryData.barChartData.push({
        name: "Points/match",
        value: element.Pointsmatch,
      });
      countryData.barChartData.push({
        name: "Scored",
        value: element.Goal_For,
      });
      countryData.barChartData.push({
        name: "Conceded",
        value: element.Goal_Against,
      });
    }
  });

  return countryData;
};

// function that updates the pie chart
const updatePieChart = function (data, feature) {
  const { pieChartData } = getCountryData(data, feature);
  // domain
  pieChartColors.domain(pieChartData.map((pieChartDatum) => pieChartDatum.id));
  pieChartLegend.call(pieChartColorLegend);

  // setting paths
  const paths = pieChartSvg.selectAll("path").data(pie(pieChartData));

  // select the legend items and add a stroke
  const pieRects = d3.selectAll(".legendCells rect").data(pieChartData);
  pieRects.attr("stroke", "black").attr("stroke-width", 0.5);

  // deleting elements
  paths.exit().remove();

  // update current elements
  paths
    .attr("d", arcPath)
    .transition()
    .duration(750)
    .attrTween("d", arcTweenUpdate);

  // create elements for provided data
  paths
    .enter()
    .append("path")
    .attr("class", "arc")
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .attr("fill", (d) => pieChartColors(d.data.id))
    .each(function (d) {
      this.data = d;
    })
    .transition()
    .duration(1000)
    .attrTween("d", arcTweenEnter);

  // show tooltip on mouseover
  // hide tooltip on mouseout
  pieChartSvg
    .selectAll("path")
    .on("mouseover", (mouseoverData, arcData) => {
      tip.html((mouseoverData) => {
        return `${mouseoverData.value}`;
      });
      tip.show(arcData, mouseoverData.target);
    })
    .on("mouseout", () => {
      tip.hide();
    });
};

function handleRects(countryData) {
  // barGraphTitle.text(`Country data on EURO`).style("font-size", 17);

  let colors = [
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
      let value = Math.round(colorScale(d.value));
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
      let value = Math.round(colorScale(d.value));
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
  let x = 10;
  for (let i = 0; i < 8; i++) {
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
      tip.html((d) => {
        return `${d.value}`;
      });
      tip.show(i, d.target);
    })
    .on("mouseout", (d) => {
      tip.hide();
    });
}

function addBarGraphAxes() {
  barChartAxisX.transition().duration(1500).call(xAxis);

  barChartAxisY.transition().duration(1500).call(yAxis);

  barChartAxisX.attr("font-size", 15);
  barChartAxisY.attr("font-size", 15);
}

function updateBarChart(data, feature) {
  country.innerHTML = `${feature.properties.name}`;

  const { barChartData } = getCountryData(data, feature);

  yScale.domain([0, d3.max(barChartData, (d) => d.value)]);
  xScale.domain(barChartData.map((d) => d.name));

  colorScale.domain([0, d3.max(barChartData, (d) => d.value)]);
  handleRects(barChartData);
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

const country = document.querySelector(".country");

const barGraphTitle = barChartSvg
  .append("text")
  .attr("transform", "translate(150,15)");

function onClick(d, feature) {
  let flag = false;

  d3.json("euro_cup_teams.json").then(function (data) {
    data.forEach((element) => {
      if (element.Country == feature.properties.name) {
        if (element.Country == "United Kingdom") {
          if (flag == false) {
            chooseUKCountry(data, feature);
            flag = true;
          }
        } else {
          updatePieChart(data, feature);
          updateBarChart(data, feature);
        }
      }
    });
  });
}

function chooseUKCountry(data, i) {
  let selectionContainer = document.querySelector("#selection");
  selectionContainer.innerHTML = `
        <div class="selection-box">
            <div class="selection-box__header">
                <h3>Choose UK country you want to display: </h3>
                <input class="selection-box__delete-button" type="image" src="img/button-delete.png">
            </div>
            <div class="selection-box__buttons">
                <button class="selection-box__button"><span>England</span></button>
                <button class="selection-box__button"><span>Northern Ireland</span></button>
                <button class="selection-box__button"><span>Scotland</span></button>
                <button class="selection-box__button"><span>Wales</span></button>
            </div>
        </div>
    `;

  const closeButton = document.querySelector(".selection-box__delete-button");
  closeButton.addEventListener("click", onClickClose);

  const countryButtons = Array.from(
    document.querySelectorAll(".selection-box__button")
  );
  // console.log(countryButtons);
  // console.log(data[0]);

  for (let i = 0; i < countryButtons.length; i++) {
    //console.log(countryButtons[i]);
    let countryButton = countryButtons[i];
    countryButton.addEventListener("click", (event) => {
      let clickedCountryButton = event.target;
      onClickClose();

      data.forEach((element) => {
        if (element.Team == clickedCountryButton.textContent) {
          let myUKTeam = {
            properties: { name: element.Team },
          };

          updateBarChart(data, myUKTeam);
          updatePieChart(data, myUKTeam);
        }
      });
      //globalcountry = clickedCountryButton.textContent;
    });
  }
}

function onClickClose() {
  const selectionBox = document.querySelector(".selection-box");
  selectionBox.remove();
}

function onMouseOver(i, d) {
  euroCupTeams.forEach((element) => {
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

const arcTweenEnter = function (data) {
  const interpolate = d3.interpolate(data.endAngle, data.startAngle);

  return function (t) {
    data.startAngle = interpolate(t);
    return arcPath(data);
  };
};

const barWidthTween = function (d) {
  let i = d3.interpolate(0, xScale.bandwidth());
  return function (t) {
    return i(t);
  };
};
