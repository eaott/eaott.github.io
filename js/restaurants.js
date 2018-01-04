var restaurants = [];
var descriptors = new Set();
var displayRestaurants = [];
var randomRestaurants = [];
var days = ["Sunday", "Monday", "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday"];

function getRestaurantFilter() {
  let now = new Date();
  let dayOfWeek = days[now.getDay()];
  let night = now.getHours() >= 17 || now.getHours() <= 4;
  let closedFilter = function(r) {
    // FIXME: assume for now that r.closed is just one day per week or none.
    if (r.closed == dayOfWeek) {
      return false;
    }
    if (night && r.earlyOnly == "Y") {
      return false;
    }
    return true;
  }

  // Filter by whether we've been there
  let beenNew = document.getElementById("beenNew");
  let beenOld = document.getElementById("beenOld");
  let newFilter = function(r) {
    return (beenNew.checked && r.beenBefore == "N");
  };
  let beenFilter = function(r){
    return (
      (beenNew.checked && r.beenBefore == "N") ||
      (beenOld.checked && r.beenBefore == "Y")
    );
  };

  // Filter by local/chain
  let localLocal = document.getElementById("localLocal");
  let localChain = document.getElementById("localChain");
  let localFilter = function(r){
    return (
      (localLocal.checked && r.local == "Y") ||
      (localChain.checked && r.local == "N")
    );
  };

  // Filter by cost
  let cost1 = document.getElementById("cost1");
  let cost2 = document.getElementById("cost2");
  let cost3 = document.getElementById("cost3");
  let cost4 = document.getElementById("cost4");
  let cost5 = document.getElementById("cost5");
  let costFilter = function(r){
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
  let rating1 = document.getElementById("rating1");
  let rating2 = document.getElementById("rating2");
  let rating3 = document.getElementById("rating3");
  let rating4 = document.getElementById("rating4");
  let rating5 = document.getElementById("rating5");
  let ratingFilter = function(r){
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
  let healthiness1 = document.getElementById("healthiness1");
  let healthiness2 = document.getElementById("healthiness2");
  let healthiness3 = document.getElementById("healthiness3");
  let healthiness4 = document.getElementById("healthiness4");
  let healthiness5 = document.getElementById("healthiness5");
  let healthinessFilter = function(r){
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
  let distance1 = document.getElementById("distance1");
  let distance2 = document.getElementById("distance2");
  let distance3 = document.getElementById("distance3");
  let distance4 = document.getElementById("distance4");
  let distance5 = document.getElementById("distance5");
  let distanceFilter = function(r){
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
  let parking1 = document.getElementById("parking1");
  let parking2 = document.getElementById("parking2");
  let parking3 = document.getElementById("parking3");
  let parking4 = document.getElementById("parking4");
  let parking5 = document.getElementById("parking5");
  let parkingFilter = function(r){
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
  let enabledDescriptors = new Set();
  for (let d of descriptors) {
    let dID = d.replace(/\s/g, '');
    let input = document.getElementById(dID);
    if (input.checked) {
      enabledDescriptors.add(d);
    }
  }
  // Short-circuit: if all enabled, don't worry about filtering. This prevents
  // records with no descriptors from being filtered out.
  let shortCircuit = enabledDescriptors.size == descriptors.size;
  let descriptorFilter = function(r){
    if (shortCircuit) {
      return true;
    }
    for (let d of r.descriptors) {
      if (enabledDescriptors.has(d)) {
        return true;
      }
    }
    return (newFilter(r) && (r.descriptors.length == 0 || (r.descriptors.length == 1 && r.descriptors[0] == "")));
  }

  // Construct full filter
  return function(r){
    let val = (
      closedFilter(r) &&
      beenFilter(r) &&
      localFilter(r) &&
      costFilter(r) &&
      ratingFilter(r) &&
      healthinessFilter(r) &&
      distanceFilter(r) &&
      parkingFilter(r) &&
      descriptorFilter(r));

    return val;
  };
}

function restaurantSorter(a, b) {
  let x = a.place.toLowerCase();
  let y = b.place.toLowerCase();
  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
}

function restaurantRandomSorter(a, b) {
  // Uniform [-1/2, 1/2] (idk about endpoints, and don't care)
  return 0.5 - Math.random();
}

function updateGraphHelper(rs, id) {
  let counter = rs.length;
  for (var i = 0; i < counter; i++) {
    let marksCanvas = document.getElementById(id + i);
    let r = rs[i];
    let marksData = {
      labels: ["$", "\u2605", "\u2618", "\u26FD", "\u267F"],
      datasets: [{
        // label: "Student A",
        label: "",
        backgroundColor: "rgba(200,0,0,0.2)",
        data: [r.cost, r.rating, r.healthiness, r.distance, r.parking]
      }]
    };

    let radarChart = new Chart(marksCanvas, {
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

function updateGraphs() {
  updateGraphHelper(randomRestaurants, "resultCanvasRandom");
  updateGraphHelper(displayRestaurants, "resultCanvas");
}

function restaurantDiv(r, id) {
  let t = '<div class="container"><div class="place"><br>';
  t = t + r.place;
  t = t + '&nbsp;&nbsp;&nbsp;&nbsp;</div><div style="display:inline-block; font-size:20%;">';
  t = t + '<canvas id="resultCanvas' + id + '" height="80" width="80"></canvas>';
  t = t + "</div></div>";
  return t;
}

function display() {
  displayRestaurants = restaurants.filter(
    getRestaurantFilter()
  );
  randomRestaurants = displayRestaurants.sort(restaurantRandomSorter).slice(0, 3).sort(restaurantSorter);
  let text = '';
  let counter = 0;
  for (let r of randomRestaurants) {
    let t = restaurantDiv(r, 'Random' + counter);
    text = text + t;
    counter += 1;
  }
  document.getElementById("randomResults").innerHTML = text;

  displayRestaurants.sort(restaurantSorter);

  text = '';
  counter = 0;
  for (let r of displayRestaurants) {
    let t = restaurantDiv(r, counter);
    text = text + t;
    counter = counter + 1;
  }
  text = text + "";
  document.getElementById("results").innerHTML = text;
  $("#results").ready(updateGraphs);
}

function displayFromDescriptor() {
  // Need to do some quick resets.
  // filterDisplayDescriptors(descriptors);
  display();
}

function createDescriptors() {
  for (let r of restaurants) {
    for (let d of r.descriptors) {
      if (d.length > 0)
        descriptors.add(d);
    }
  }
  let sortedDescriptors = Array.from(descriptors).sort();
  let text = '';
  for (let d of sortedDescriptors) {
    let idVersion = d.replace(/\s/g, '');
    let t = '<div id="'
    t = t + idVersion;
    t = t +'Container"><input type="checkbox" checked name="';
    t = t + idVersion;
    t = t + '" id="';
    t = t + idVersion;
    t = t + '" onclick="displayFromDescriptor()"><label for="';
    t = t + idVersion;
    t = t + '">' + d + '</label><br></div>';
    text = text + t;
  }
  document.getElementById("descriptors").innerHTML = text;
}

$.getJSON("data.json", function(result) {
  restaurants = result["restaurants"];
  createDescriptors();
  display();
});

function presets(presetMap) {
  for (let key of presetMap.keys()) {
    let children = $("#" + key).children("input");
    if (key == 'descriptors') {
      children = $("#" + key).children("div").children("input");
    }
    $.each(children, function(idx, e){
      let eID = e.id.replace(/\s/g, '');
      $("#" + eID).prop("checked", presetMap.get(key).has(eID));
    });
  }
  display();
}

function filterDisplayDescriptors(ds) {
  console.log(ds);
  if (ds.length == 0) {
    // Make a copy of the full list
    ds = Array.from(descriptors);
    // FIXME: Maybe also trigger a noise / flash thing
    $("#descriptorSearch").addClass('has-error');
  }
  else {
    $("#descriptorSearch").removeClass('has-error');
  }
  let s = new Set(ds);
  for (let d of descriptors) {
    let dID = d.replace(/\s/g, '');
    if (s.has(d)) {
      // Matched! We should keep it
      $("#" + dID + "Container").removeClass('hide');
    }
    else {
      // Not matched! Make it go away.
      $("#" + dID + "Container").addClass('hide');
    }
  }
}

window.onload = function() {
  // When restaurants loaded, update graphs.
  $("#results").ready(updateGraphs);

  // Fancy animations to expand/contract sections.
  $('.collapse').on(
    'shown.bs.collapse',
    function(){
      $(this).parent().find(".glyphicon-chevron-down").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
    }
  ).on(
    'hidden.bs.collapse',
    function(){
      $(this).parent().find(".glyphicon-chevron-up").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
  });

  $("#refreshBtn").on('click', function(e){
    randomRestaurants = displayRestaurants.sort(restaurantRandomSorter).slice(0, 3).sort(restaurantSorter);
    let text = '';
    let counter = 0;
    for (let r of randomRestaurants) {
      let t = restaurantDiv(r, 'Random' + counter);
      text = text + t;
      counter += 1;
    }
    document.getElementById("randomResults").innerHTML = text;
    updateGraphHelper(randomRestaurants, "resultCanvasRandom");
  });

  /*
   * Section for common-use-case filters. This helps with certain scenarios
   * like entertaining visitors (Tourist), etc.
   */
  $("#touristBtn").on('click', function(e){
    let touristPresets = new Map();
    // Only visited, local
    touristPresets.set('new', new Set(['beenOld']));
    touristPresets.set('local', new Set(['localLocal']));
    // Not cheap places
    touristPresets.set('cost', new Set(['cost3', 'cost4']));
    touristPresets.set('rating', new Set(['rating3', 'rating4', 'rating5']));
    touristPresets.set('healthiness', new Set(['healthiness1', 'healthiness2', 'healthiness3', 'healthiness4', 'healthiness5']));
    touristPresets.set('distance', new Set(['distance1', 'distance2', 'distance3', 'distance4']));
    touristPresets.set('parking', new Set(['parking3', 'parking4', 'parking5']));
    presets(touristPresets);
  });
  $("#adventureBtn").on('click', function(e){
    let adventurePresets = new Map();
    // Only visited, local
    adventurePresets.set('new', new Set(['beenNew']));
    adventurePresets.set('local', new Set(['localLocal', 'localChain']));
    // Not cheap places
    adventurePresets.set('cost', new Set(['cost1', 'cost2', 'cost3', 'cost4']));
    adventurePresets.set('rating', new Set(['rating1', 'rating2', 'rating3', 'rating4', 'rating5']));
    adventurePresets.set('healthiness', new Set(['healthiness1', 'healthiness2', 'healthiness3', 'healthiness4', 'healthiness5']));
    adventurePresets.set('distance', new Set(['distance1', 'distance2', 'distance3', 'distance4']));
    adventurePresets.set('parking', new Set(['parking2','parking3', 'parking4', 'parking5']));
    presets(adventurePresets);
  });
  // Remove all descriptors (empty list, except for some new places)
  $("#clearDescriptors").on('click', function(e){
    let m = new Map();
    m.set('descriptors', new Set());
    presets(m);
  });
  $("#selectDescriptors").on('click', function(e){
    let m = new Map();
    m.set('descriptors', descriptors);
    presets(m);
  });


  var substringMatcher = function(strs) {
    return function findMatches(q, cb) {
      var matches, substringRegex;

      // an array that will be populated with substring matches
      matches = [];

      // regex used to determine if a string contains the substring `q`
      substrRegex = new RegExp(q, 'i');

      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(strs, function(i, str) {
        if (substrRegex.test(str)) {
          matches.push(str);
        }
      });
      // Normal typeahead does cb(matches); to display the list.
      // We just want to cleverly filter, using their fancy typing business.
      filterDisplayDescriptors(matches);
      // cb(matches);
    };
  };

  // Add typeahead for the descriptors
  $('#descriptorSearch .typeahead').typeahead(
    {
      hint: true,
      highlight: true,
      minLength: 0
    },
    {
      name: 'descriptors',
      source: substringMatcher(Array.from(descriptors))
    }
  );
}
