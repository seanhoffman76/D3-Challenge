// Code for Chart is Wrapped Inside a Function That Automatically Resizes the Chart
function makeResponsive() {

  // If SVG Area is not Empty When Browser Loads, Remove & Replace with a Resized Version of Chart
  var svgArea = d3.select("body").select("svg");

  // Clear SVG is Not Empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  var svgWidth = 960;
  var svgHeight = 500;

  var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Append an SVG group
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
  var chosenXAxis = "poverty";
  var chosenYAxis = "healthcare";

  // function used for updating x-scale var upon click on axis label
  function xScale(behaveData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(behaveData, d => d[chosenXAxis]) * 0.8,
        d3.max(behaveData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
    return xLinearScale;
  }

  // function used for updating y-scale var upon click on axis label
  function yScale(behaveData, chosenYAxis) {
      // create scales
      var yLinearScale = d3.scaleLinear()
        .domain([d3.min(behaveData, d => d[chosenYAxis]) * 0.8,
          d3.max(behaveData, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);
      return yLinearScale;
    }

  // function used for updating xAxis var upon click on axis label
  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
    return xAxis;
  }

  // function used for updating yAxis var upon click on axis label
  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
    return yAxis;
  }

  // function used for updating circles group with a transition to new circles
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
  }

  // function used for updating text group with a transition to new text
  function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    textGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]))
      .attr("text-anchor", "middle");
    return textGroup;
  }

  // Function for Updating Circles Group with New Tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {
    if (chosenXAxis === "poverty") {
      var xLabel = "In Poverty (%)";
    }
    else if (chosenXAxis === "age") {
      var xLabel = "Age (median)";
    }
    else {
      var xLabel = "Household Income (median)";
    }
    if (chosenYAxis === "healthcare") {
      var yLabel = "Lacks Healthcare (%)";
    }
    else if (chosenYAxis === "obesity") {
      var yLabel = "Obese (%)";
    }
    else {
      var yLabel = "Smokes (%)";
    }
    // Setup the tool tip.
    var tool_tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-8, 80])
      .html(function(d) { return (`<strong>${d.abbr}</strong><br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`)
    });

    // Create Circles Tooltip in the Chart
    circlesGroup.call(tool_tip);
    // Create Event Listeners to Display and Hide the Circles Tooltip
    circlesGroup.on("mouseover", function(data) {
      tool_tip.show(data, this);
    })
      // onmouseout Event
      .on("mouseout", function(data) {
        tool_tip.hide(data);
      });
    // Create Text Tooltip in the Chart
    textGroup.call(tool_tip);
    // Create Event Listeners to Display and Hide the Text Tooltip
    textGroup.on("mouseover", function(data) {
      tool_tip.show(data, this);
    })
      // onmouseout Event
      .on("mouseout", function(data) {
        tool_tip.hide(data);
      });
    return circlesGroup;
  };

  // Retrieve data from the CSV file and execute everything below
  d3.csv("/D3-Challenge/assets/data/data.csv").then(function(behaveData, err) {
    if (err) throw err;
  
    // parse data
    behaveData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });
  
    // xLinearScale and yLinearScale functions above csv import
    var xLinearScale = xScale(behaveData, chosenXAxis);
    var yLinearScale = yScale(behaveData, chosenYAxis);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(behaveData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 15)
      .attr("fill", "purple")
      .attr("opacity", ".70");

    // append text info to circles
    var textGroup = chartGroup.selectAll(null)
      .data(behaveData)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis] * 0.99))
      .text(d => (d.abbr))
      .attr("class", "text")
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .attr("fill", "white");
  
    // Create group for  3 x- axis labels
    var labelsGroupX = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var povertyLabel = labelsGroupX.append("text")
      .attr("x", 0)
      .attr("y", 18)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");
  
    var ageLabel = labelsGroupX.append("text")
      .attr("x", 0)
      .attr("y", 38)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (median)");

    var incomeLabel = labelsGroupX.append("text")
      .attr("x", 0)
      .attr("y", 58)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (median)");
  
    // Create group for  3 y- axis labels
    var labelsGroupY = chartGroup.append("g")
        .attr("transform", `translate(-20, ${height / 2})`);
    
      var healthcareLabel = labelsGroupY.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -20)
        .attr("x", 0)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .text("Lacks Healthcare (%)");
    
      var obesityLabel = labelsGroupY.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", 0)
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obese (%)");
  
      var smokesLabel = labelsGroupY.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", 0)
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
  
    // x axis labels event listener
    labelsGroupX.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = value;
  
          // updates x scale for new data
          xLinearScale = xScale(behaveData, chosenXAxis);
  
          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);
  
          // updates circles with new values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // updates text with new values
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
  
          // changes classes to change bold text
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "age") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

    // y axis labels event listener
    labelsGroupY.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

          // replaces chosenYAxis with value
          chosenYAxis = value;

          // updates y scale for new data
          yLinearScale = yScale(behaveData, chosenYAxis);

          // updates y axis with transition
          yAxis = renderYAxes(yLinearScale, yAxis);

          // updates circles with new values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // updates text with new values
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

          // changes classes to change bold text
          if (chosenYAxis === "healthcare") {
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "obesity") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
  });
};

// When Browser Loads, makeResponsive() is Called
makeResponsive();

// When Browser Window is Resized, makeResponsive() is Called
d3.select(window).on("resize", makeResponsive);
