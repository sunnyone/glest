(function () {
    var formData = {
        totalSizeTb: 75,
        retrieveSize: 140,
        daysPerMonth: 30,
        retrievePricePerHour: 0.0114,
        usdJpy: 120
    };

    var viewModel = new Vue({
        el: '#vars-form',
        data: formData,
    });

    function setSliderValuesFromViewModel() {
        $('#total-size-tb-slider').foundation('slider', 'set_value', viewModel.totalSizeTb);
        $('#retrieve-size-slider').foundation('slider', 'set_value', viewModel.retrieveSize);
    }

    function setSliderValuesToViewModel() {
        viewModel.totalSizeTb = $('#total-size-tb-slider').attr('data-slider');
        viewModel.retrieveSize = $('#retrieve-size-slider').attr('data-slider');
    }


    function calculatePrice(retrieveHours, opts) {
        if (retrieveHours > 24) {
            throw new Error("Only one day is supported.");
        }

        var freeRatio = 0.05;
        var freeSizePerMonth = opts.totalSizeTb * 1024 * freeRatio;
        var freeSizePerDay = freeSizePerMonth / opts.daysPerMonth;

        var peakRate = opts.retrieveSize / retrieveHours;
        var freeSizePerHour = freeSizePerDay / retrieveHours;
        var peakRateReduced = peakRate - freeSizePerHour;

        var price = peakRateReduced * opts.retrievePricePerHour * (opts.daysPerMonth * 24);
        return (price > 0 ? price * opts.usdJpy : 0);
    }

    function generateData() {
        var array = [];

        for (var i = 3; i <= 24; i++) {
            var price = calculatePrice(i, formData);
            array.push({ x: i, y: price });
        }

        return [
          {
              values: array,
              key: '料金',
              color: '#ff7f0e'
          }
        ];
    }

    nv.addGraph(function () {
        // Setup the chart
        var chart = nv.models.lineChart()
                      .margin({ left: 100 })
                      .useInteractiveGuideline(true)
                      .transitionDuration(350)
                      .showLegend(false)
                      .showYAxis(true)
                      .showXAxis(true)
        ;

        chart.xAxis
            .axisLabel('取り出し時間(時間)')
            .tickFormat(d3.format(',r'));

        chart.yAxis
            .axisLabel('料金(円)')
            .tickFormat(d3.format(',.0f'));
            //.tickFormat(d3.format(',.02f'));

        // Update the chart when window resizes.
        nv.utils.windowResize(function () { chart.update() });

        // Set initial data
        function setDataToChart() {
            d3.select('#chart svg')
                .datum(generateData())
                .call(chart);
        }
        
        setDataToChart();
        viewModel.$watch('totalSizeTb', setDataToChart);
        viewModel.$watch('retrieveSize', setDataToChart);
        viewModel.$watch('daysPerMonth', setDataToChart);
        viewModel.$watch('retrievePricePerHour', setDataToChart);
        viewModel.$watch('usdJpy', setDataToChart);

        return chart;
    });

    // set initial values
    setSliderValuesFromViewModel();

    // set handler
    $(document).foundation({
        slider: {
            on_change: function () {
               setSliderValuesToViewModel();
            }
        }
    });

})();
