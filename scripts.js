document.addEventListener('DOMContentLoaded', function(event) {  
  // @todo: refactor into own autocomplete module.
  function autocomplete(inp, haystackValues) {
    // the autocomplete function takes two arguments,
    // an array of text field element and an array of possible autocompleted values:*/
    var currentFocus;
    
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < haystackValues.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (haystackValues[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + haystackValues[i].substr(0, val.length) + "</strong>";
          b.innerHTML += haystackValues[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + haystackValues[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
            /*insert the value for the autocomplete text field:*/
            inp.value = this.getElementsByTagName("input")[0].value;
            /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
              closeAllLists();
            });
            a.appendChild(b);
          }
        }
      });
      
      /*execute a function presses a key on the keyboard:*/
      inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
      });
      
      
      function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
      }
      function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
          x[i].classList.remove("autocomplete-active");
        }
      }
      function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
          if (elmnt != x[i] && elmnt != inp) {
            x[i].parentNode.removeChild(x[i]);
          }
        }
      }
      /*execute a function when someone clicks in the document:*/
      document.addEventListener("click", function (e) {
        closeAllLists(e.target);
      });
    }
    
    
    const getJSONdata = async () => {
      const fileToFetch = 'destinations.json';
      try {
        const response = await fetch(fileToFetch);
        if (response.ok) {
          const responseBodyObj = await response.json(); // .json() returns an obj parsed from the json body of the response.
          return responseBodyObj.data;
        }
      } catch (error) {
        console.log(error);
      }
    }
    
    /**
    * Converts an array of objects to an object.
    * So that insetad of:
    *  const peopleArray = [
      { id: 123, name: "dave", age: 23 },
      { id: 456, name: "chris", age: 23 },
    ]
    * ...we can work with:
    *  const peopleObject = {
      "123": { id: 123, name: "dave", age: 23 },
      "456": { id: 456, name: "chris", age: 23 },
    }
    * ...then we can query for data with:
    * const selectedPerson = peopleObject[idToSelect];
    * https://medium.com/dailyjs/rewriting-javascript-converting-an-array-of-objects-to-an-object-ec579cafbfc7
    * 
    */
    const arrayToObject = (array, keyField) =>
    array.reduce((obj, item) => {
      obj[item[keyField]] = item
      return obj
    }, {})
    
    
    // Runs on init.
    getJSONdata().then(function(promiseValue) {
      const villagesObj = arrayToObject(promiseValue, 'label');
      let destinationNames = [];
      for (let index in promiseValue) {
        destinationNames.push(promiseValue[index].label);
      }
      autocomplete(document.querySelector('#search-input'), destinationNames);
      autocomplete(document.querySelector('#search-input2'), destinationNames);
      autocomplete(document.querySelector('#search-input3'), destinationNames);
      
      
      document.querySelector('#search-form').addEventListener('submit', function(e) {
        let inputsArray = [];
        // @todo: fix when user only populates 2 input boxes...
        inputsArray.push(document.querySelector('#search-input').value, document.querySelector('#search-input2').value, document.querySelector('#search-input3').value);
        const input1 = document.querySelector('#search-input').value;
        const input2 = document.querySelector('#search-input2').value;
        const input3 = document.querySelector('#search-input3').value;

        // Initialise with a ridiculously high value.
        let min = 10000000;
        let nearestVillage = {};
        for (let i = 0; i < inputsArray.length; i++) {
          let eta = villagesObj[inputsArray[i]].eta;
          if (eta < min) {
            min = eta;
            nearestVillage.label = villagesObj[inputsArray[i]].label;
            nearestVillage.eta = villagesObj[inputsArray[i]].eta;
            nearestVillage.distance = villagesObj[inputsArray[i]].distance;
          }
        }
        alert(`Nearest village is: ${nearestVillage.label}, ${nearestVillage.distance} kms away, ${nearestVillage.eta} minutes drive`);

        // @todo: add a clear button.
        // @todo: add responsiveness for mobile.
        e.preventDefault();
      })
      
    })
    
  })

