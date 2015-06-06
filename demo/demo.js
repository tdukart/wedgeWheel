requirejs.config({
  baseUrl: '../src/'
});

define(['lucky-wheel'], function(Wheel) {
  var wedges = [
    {
      name: 'Red',
      probability: 25,
      color: 'red'
    }, {
      name: 'Purple',
      probability: 50,
      color: 'purple'
    }, {
      name: 'Maroon',
      probability: 30,
      color: 'maroon'
    }, {
      name: 'Invalid Color',
      probability: 20,
      color: '53q4etagdsvz'
    }
  ];

  var wheel = new Wheel(document.getElementById('spinnerParent'), 500, wedges);

  wheel.addWedge('Pink', 40, 'pink');

  document.getElementById('spinButton').onclick = function() {
    wheel.spin();
  };

  document.getElementById('resetButton').onclick = function() {
    wheel.reset();
  };
});