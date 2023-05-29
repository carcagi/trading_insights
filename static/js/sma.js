var chart;
      // Fetch initial chart data when the page loads
      $(document).ready(function () {
        $.ajax({
          url: "/data?asset=ETH/USDT&window=60",
          method: "GET",
          dataType: "json",
          success: function (data) {
            createChart(data);
            addCustomMarkers();
          },
          error: function (xhr, status, error) {
            console.error(error);
          },
        });
      });

      // Function to fetch data from the server
      function fetchData(asset, window) {
        return $.getJSON("/data?asset=" + asset + "&window=" + window);
      }

      // Function to fetch intersections from the server

      function addCustomMarkers() {
        var annotations = [];
        var asset = $("#asset-input").val();
        var windowValue = $("#window-input").val();

        // Fetch the intersections data from the server
        $.getJSON(
          "/intersections?asset=" + asset + "&window=" + windowValue,
          function (intersections) {
            intersections.forEach(function (intersection) {
              var index = intersection[0];
              var x = new Date(chart.data.datasets[0].data[index].x);
              var y = chart.data.datasets[0].data[index].y;
              var color = intersection[2] === "buy" ? "green" : "red";

              // Create an annotation object for the custom marker
              var annotation = {
                type: "point",
                xScaleID: "x",
                yScaleID: "y",
                xValue: x,
                yValue: y,
                backgroundColor: color,
                borderColor: "black",
                borderWidth: 1,
                radius: 6,
              };

              annotations.push(annotation);
            });

            // Add the annotations to the chart
            chart.options.plugins.annotation.annotations = annotations;
            chart.update();
          }
        );
      }

      // Function to create the chart with the provided data
      function createChart(data) {
        var ctx = document.getElementById("chart").getContext("2d");
        chart = new Chart(ctx, {
          type: "line",
          data: {
            datasets: [
              {
                label: "Close",
                borderColor: "rgb(75, 192, 192)",
                data: data.map((item) => ({
                  x: new Date(item.timestamp),
                  y: item.close,
                })),
              },
              {
                label: "SMA Short",
                borderColor: "rgb(255, 99, 132)",
                data: data.map((item) => ({
                  x: new Date(item.timestamp),
                  y: item.sma_short,
                })),
              },
              {
                label: "SMA Long",
                borderColor: "rgb(255, 205, 86)",
                data: data.map((item) => ({
                  x: new Date(item.timestamp),
                  y: item.sma_long,
                })),
              },
            ],
          },
          options: {
            scales: {
              x: {
                type: "time",
                time: {
                  unit: "day",
                },
              },
              y: {
                beginAtZero: false,
              },
            },
          },
        });

        // Event listener for form submission
        $("#asset-form").on("submit", function (e) {
          e.preventDefault();

          var asset = $("#asset-input").val();
          var windowValue = $("#window-input").val();

          // Fetch updated data and update the chart
          $.getJSON(
            "/data?asset=" + asset + "&window=" + windowValue,
            function (updatedData) {
              // Update the chart datasets with the new data
              chart.data.datasets[0].data = updatedData.map((item) => ({
                x: new Date(item.timestamp),
                y: item.close,
              }));
              chart.data.datasets[1].data = updatedData.map((item) => ({
                x: new Date(item.timestamp),
                y: item.sma_short,
              }));
              chart.data.datasets[2].data = updatedData.map((item) => ({
                x: new Date(item.timestamp),
                y: item.sma_long,
              }));

              chart.update();
            }
          );
        });
      }