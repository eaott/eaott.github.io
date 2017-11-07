var restaurants = [];
var descriptors = new Set();

function getRestaurantFilter() {
  // Filter by whether we've been ther
  var beenNew = document.getElementById("beenNew");
  var beenOld = document.getElementById("beenOld");
  var newFilter = function(r) {
    return (beenNew.checked && r.beenBefore == "N");
  };
  var beenFilter = function(r){
    return (
      (beenNew.checked && r.beenBefore == "N") ||
      (beenOld.checked && r.beenBefore == "Y")
    );
  };

  // Filter by local/chain
  var localLocal = document.getElementById("localLocal");
  var localChain = document.getElementById("localChain");
  var localFilter = function(r){
    return (
      (localLocal.checked && r.local == "Y") ||
      (localChain.checked && r.local == "N")
    );
  };

  // Filter by cost
  var cost1 = document.getElementById("cost1");
  var cost2 = document.getElementById("cost2");
  var cost3 = document.getElementById("cost3");
  var cost4 = document.getElementById("cost4");
  var cost5 = document.getElementById("cost5");
  var costFilter = function(r){
    return (
      (cost1.checked && r.cost == "1") ||
      (cost2.checked && r.cost == "2") ||
      (cost3.checked && r.cost == "3") ||
      (cost4.checked && r.cost == "4") ||
      (cost5.checked && r.cost == "5") ||
      (newFilter(r) && r.cost == "")
    );
  };

  // Filter by rating
  var rating1 = document.getElementById("rating1");
  var rating2 = document.getElementById("rating2");
  var rating3 = document.getElementById("rating3");
  var rating4 = document.getElementById("rating4");
  var rating5 = document.getElementById("rating5");
  var ratingFilter = function(r){
    return (
      (rating1.checked && r.rating == "1") ||
      (rating2.checked && r.rating == "2") ||
      (rating3.checked && r.rating == "3") ||
      (rating4.checked && r.rating == "4") ||
      (rating5.checked && r.rating == "5") ||
      (newFilter(r) && r.rating == "")
    );
  };

  // Filter by healthiness
  var healthiness1 = document.getElementById("healthiness1");
  var healthiness2 = document.getElementById("healthiness2");
  var healthiness3 = document.getElementById("healthiness3");
  var healthiness4 = document.getElementById("healthiness4");
  var healthiness5 = document.getElementById("healthiness5");
  var healthinessFilter = function(r){
    return (
      (healthiness1.checked && r.healthiness == "1") ||
      (healthiness2.checked && r.healthiness == "2") ||
      (healthiness3.checked && r.healthiness == "3") ||
      (healthiness4.checked && r.healthiness == "4") ||
      (healthiness5.checked && r.healthiness == "5") ||
      (newFilter(r) && r.healthiness == "")
    );
  };


  // Filter by distance
  var distance1 = document.getElementById("distance1");
  var distance2 = document.getElementById("distance2");
  var distance3 = document.getElementById("distance3");
  var distance4 = document.getElementById("distance4");
  var distance5 = document.getElementById("distance5");
  var distanceFilter = function(r){
    return (
      (distance1.checked && r.distance == "1") ||
      (distance2.checked && r.distance == "2") ||
      (distance3.checked && r.distance == "3") ||
      (distance4.checked && r.distance == "4") ||
      (distance5.checked && r.distance == "5") ||
      (newFilter(r) && r.distance == "")
    );
  };

  // Filter by parking
  var parking1 = document.getElementById("parking1");
  var parking2 = document.getElementById("parking2");
  var parking3 = document.getElementById("parking3");
  var parking4 = document.getElementById("parking4");
  var parking5 = document.getElementById("parking5");
  var parkingFilter = function(r){
    return (
      (parking1.checked && r.parking == "1") ||
      (parking2.checked && r.parking == "2") ||
      (parking3.checked && r.parking == "3") ||
      (parking4.checked && r.parking == "4") ||
      (parking5.checked && r.parking == "5") ||
      (newFilter(r) && r.parking == "")
    );
  };

  // Look up the inputs by ID, report their checked state.
  var enabledDescriptors = new Set();
  for (let d of descriptors) {
    var input = document.getElementById(d);
    if (input.checked) {
      enabledDescriptors.add(d);
    }
  }
  var descriptorFilter = function(r){
    for (let d of r.descriptors) {
      if (enabledDescriptors.has(d)) {
        return true;
      }
    }
    return (newFilter(r) && r.descriptors.length == 1 && r.descriptors[0] == "");
  }

  // Construct full filter
  return function(r){
    return (
      beenFilter(r) &&
      localFilter(r) &&
      costFilter(r) &&
      ratingFilter(r) &&
      healthinessFilter(r) &&
      distanceFilter(r) &&
      parkingFilter(r) &&
      descriptorFilter(r)
    );
  };
}

function restaurantSorter(a, b) {
  var x = a.place.toLowerCase();
  var y = b.place.toLowerCase();
  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
}

function updateGraphs() {
  var displayRestaurants = restaurants.filter(
    getRestaurantFilter()
  );
  displayRestaurants.sort(restaurantSorter);
  var counter = displayRestaurants.length;
  for (var i = 0; i < counter; i++) {
    var marksCanvas = document.getElementById("resultCanvas" + i);
    var r = displayRestaurants[i];
    var marksData = {
      labels: ["$", "\u2605", "\u2618", "\u26FD", "\u267F"],
      datasets: [{
        // label: "Student A",
        label: "",
        backgroundColor: "rgba(200,0,0,0.2)",
        data: [r.cost, r.rating, r.healthiness, r.distance, r.parking]
      }]
    };

    var radarChart = new Chart(marksCanvas, {
      type: 'radar',
      data: marksData,
      options: {
        scale: {
          ticks: {
            max: 5,
            min: 0,
            display: false,
            lineWidth: 0,
            drawTicks: false
          },
          pointLabels: {
            fontSize: 15
          },
          gridLines: {
            drawTicks: false
          }
        },
        legend: {
          display: false
        }
      }
    });
  }
}

function display() {
  var displayRestaurants = restaurants.filter(
    getRestaurantFilter()
  );
  displayRestaurants.sort(restaurantSorter);

  var text = '';
  var counter = 0;
  for (let r of displayRestaurants) {
    var t = '<div class="container"><div class="place"><br>';
    t = t + r.place;
    t = t + '&nbsp;&nbsp;&nbsp;&nbsp;</div><div style="display:inline-block; font-size:20%;">';
    t = t + '<canvas id="resultCanvas' + counter + '" height="80" width="80"></canvas>';
    t = t + "</div></div>";
    text = text + t;
    counter = counter + 1;
  }
  text = text + "";
  document.getElementById("results").innerHTML = text;
  $("#results").ready(updateGraphs);
}

function createDescriptors() {
  for (let r of restaurants) {
    for (let d of r.descriptors) {
      if (d.length > 0)
        descriptors.add(d);
    }
  }
  var sortedDescriptors = Array.from(descriptors).sort();
  var text = '';
  for (let d of sortedDescriptors) {
    var t = '<input type="checkbox" checked name="';
    t = t + d;
    t = t + '" id="';
    t = t + d;
    t = t + '" onclick="display()"><label for="';
    t = t + d;
    t = t + '">' + d + '</label><br>';
    text = text + t;
  }
  document.getElementById("descriptors").innerHTML = text;
}

$.getJSON("data.json", function(result) {
  restaurants = result["restaurants"];
  createDescriptors();
  display();
});

window.onload = function() {
  $("#results").ready(updateGraphs);
}
