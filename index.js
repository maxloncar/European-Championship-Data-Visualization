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

/**
 * A linear color scale for mapping numerical values to color shades.
 *
 * @constant {d3.ScaleLinear<string>}
 * @type {d3.ScaleLinear}
 * @returns {string} A color corresponding to the input value, ranging from "white" for 0 to "blue" for 10.
 *
 */
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
const barChartGroup = d3
  .select("#graphs")
  .append("svg")
  .attr("class", "barchart");

const barChartLegend = barChartGroup
  .append("g")
  .attr("class", "barchart__legend");

const barChartSvg = barChartGroup
  .append("g")
  .attr("width", graphWidth)
  .attr("height", graphHeight)
  .attr("transform", `translate(${margin.right + 35}, ${margin.top + 20})`)
  .attr("class", "barchart__svg");

// D3TIP
// tooltip initialization
const tip = d3.tip().attr("class", "d3tip");

// invoking the tooltip in the context of visualizations
pieChartSvg.call(tip);
barChartGroup.call(tip);
svg.call(tip);

// AXISES
const barChartAxisX = barChartSvg
  .append("g")
  .attr("transform", `translate(0, ${graphHeight})`)
  .attr("class", "barchart__axis");
const barChartAxisY = barChartSvg.append("g").attr("class", "barchart__axis");

/**
 * Retrieves country-specific data for visualization in pie and bar charts.
 *
 * @param {Array<Object>} data - The array of country data objects.
 * @param {Object} feature - The feature object containing properties of the selected country.
 * @param {string} feature.properties.name - The name of the country to filter data.
 * @returns {Object} countryData - An object containing data for pie and bar charts.
 * @returns {Array<Object>} countryData.pieChartData - Data for the pie chart, including wins, draws, and losses.
 * @returns {Array<Object>} countryData.barChartData - Data for the bar chart, including participations, matches, points, points per match, goals scored, and goals conceded.
 */
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

/**
 * Updates the pie chart with new data and feature.
 *
 * @param {Object} data - The dataset containing country information.
 * @param {string} feature - The feature to visualize in the pie chart.
 *
 * @returns {void} - This function does not return a value.
 *
 * @description This function retrieves the necessary data for the pie chart,
 * updates the color domain, and manages the paths for the pie chart's arcs.
 * It handles the entering, updating, and exiting of the pie chart elements,
 * including transitions for a smooth visual update.
 */
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

  // deleting paths
  paths.exit().remove();

  // update current paths
  paths
    .attr("d", arcPath)
    .transition()
    .duration(750)
    .attrTween("d", arcTweenUpdate);

  // create paths for provided data
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

  toggleTip(pieChartSvg, "path");
};

/**
 * Handles the rendering and updating of rectangles in a bar chart.
 *
 * This function takes in the bar chart data, binds it to the rectangles,
 * and manages the enter, update, and exit selections for the rectangles.
 * It also creates a legend for the bar chart with color-coded rectangles
 * and corresponding labels.
 *
 * @param {Array<Object>} barChartData - The data to be visualized in the bar chart.
 * Each object in the array should contain:
 *   - {string} name - The name associated with the bar.
 *   - {number} value - The value associated with the bar.
 *
 * @returns {void}
 */
const handleRects = function (barChartData) {
  // select all bar chart rectangles
  const rects = barChartSvg.selectAll("rect").data(barChartData);
  // spacing between bar chart legend rectangles
  let spacingBetweenBarChartLegendRects = 10;

  // deleting rectangles
  rects.exit().remove();

  // names on X axis
  // values on Y axis
  rects
    .attr("width", barChartScaleX.bandwidth)
    .attr("fill", (d) => {
      return mapColorShades(colorScale(d.value));
    })
    .attr("x", (d) => barChartScaleX(d.name))
    .transition()
    .duration(750)
    .attr("y", (d) => barChartScaleY(d.value))
    .attr("height", (d) => graphHeight - barChartScaleY(d.value));

  // create rects for provided data
  rects
    .enter()
    .append("rect")
    .attr("height", 0)
    .attr("fill", (d) => {
      console.log(d.value);
      return mapColorShades(colorScale(d.value));
    })
    .attr("stroke", "black")
    .attr("x", (d) => barChartScaleX(d.name))
    .attr("y", graphHeight)
    .transition()
    .duration(750)
    .attrTween("width", barWidthTween)
    .attr("y", (d) => barChartScaleY(d.value))
    .attr("height", (d) => graphHeight - barChartScaleY(d.value));

  // bar chart legend in the form of rectangles
  for (let i = 0; i < 10; i++) {
    barChartLegend
      .append("rect")
      .attr("x", spacingBetweenBarChartLegendRects)
      .attr("y", 120)
      .attr("width", 25)
      .attr("height", 25)
      .attr("stroke", "black")
      .attr("fill", mapColorShades(i));
    spacingBetweenBarChartLegendRects += 30;

    // creating left bar chart legend label
    barChartLegend
      .append("text")
      .attr("x", -10)
      .attr("y", 140)
      .attr("class", "barchart__legend-label-left");

    // creating right bar chart legend label
    barChartLegend
      .append("text")
      .attr("x", 315)
      .attr("y", 140)
      .attr("class", "barchart__legend-label-right");

    // fetching bar chart legend labels
    const barChartLegendLeftLabel = d3.select(".barchart__legend-label-left");
    const barChartLegendRightLabel = d3.select(".barchart__legend-label-right");

    // bar chart legend label range values
    barChartLegendLeftLabel.text("0");
    barChartLegendRightLabel.text(d3.max(barChartData, (d) => d.value));
  }
};

/**
 * Toggles the display of a tooltip on mouse events for a specified group in a chart.
 *
 * @param {Selection} chartSvg - The SVG selection of the chart where the tooltip will be displayed.
 * @param {string} group - The selector for the group of elements to attach the tooltip events to.
 *
 * @returns {void}
 */
const toggleTip = function (chartSvg, group) {
  chartSvg
    .selectAll(group)
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

/**
 * Adds axes to the bar chart with a transition effect.
 * The X and Y axes are updated with a duration of 1500 milliseconds.
 *
 * @function addBarChartAxises
 * @returns {void}
 */
const addBarChartAxises = function () {
  barChartAxisX.transition().duration(1500).call(xAxis);
  barChartAxisY.transition().duration(1500).call(yAxis);
};

function updateBarChart(data, feature) {
  country.innerHTML = `${feature.properties.name}`;

  const { barChartData } = getCountryData(data, feature);

  barChartScaleY.domain([0, d3.max(barChartData, (d) => d.value)]);
  barChartScaleX.domain(barChartData.map((d) => d.name));

  colorScale.domain([0, d3.max(barChartData, (d) => d.value)]);
  handleRects(barChartData);
  toggleTip(barChartSvg, "rect");
  addBarChartAxises();
}

const colorScale = d3.scaleLinear().range([0, 10]);
// scales and axes for bar chart
const barChartScaleY = d3.scaleLinear().range([graphHeight, 0]);

const barChartScaleX = d3
  .scaleBand()
  .range([0, 500])
  .paddingInner(0.3)
  .paddingOuter(0.3);

const xAxis = d3.axisBottom(barChartScaleX);
const yAxis = d3.axisLeft(barChartScaleY).ticks(10);

const country = document.querySelector(".country");

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

const onMouseLeave = function () {
  tip.hide();
};

const arcTweenEnter = function (data) {
  const interpolate = d3.interpolate(data.endAngle, data.startAngle);

  return function (t) {
    data.startAngle = interpolate(t);
    return arcPath(data);
  };
};

const barWidthTween = function (d) {
  const interpolate = d3.interpolate(0, barChartScaleX.bandwidth());
  return (t) => interpolate(t);
};
