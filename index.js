const peopleInStarWars = []

const allStarwars = async () => {
  try {
    showLoader()
    const response = await fetch('https://swapi.dev/api/people/')
    return await response.json()
  } catch (err) {
    console.log(err)
  } finally {
    hideLoader()
  }
}

//----------------------- LEFT PANEL -----------------------
let h2 = document.createElement('h2')
document.getElementById('peopleUl').appendChild(h2)
h2.innerText = 'Characters'
h2.classList.add('characterTitle')

let selectedItemIndex = -1
let numberOfCharacters = 0

allStarwars()
  .then(data => {
    data.results.map(function (person) {
      numberOfCharacters++

      peopleInStarWars.push(person)
      let p = document.createElement('p')
      p.innerText = person.name
      p.classList.add('personItem')

      document.getElementById('peopleUl').appendChild(p)
      p.addEventListener('click', function (e) {
        let allP = document.querySelectorAll('p')
        let pArray = [...allP]
        pArray.forEach(p => {
          p.classList.remove('selectedCharacter')
        })

        getDetails(e)
        e.target.classList.add('selectedCharacter')
        selectedItemIndex = peopleInStarWars.findIndex(
          i => i.name === e.target.innerText
        )

        document.getElementById('countCharacter').innerText = `${
          selectedItemIndex + 1
        } / ${numberOfCharacters}`
      })
    })
  })
  .catch(err => console.log(err))

let buttonString = function addButtons () {
  return `
  <div id = buttonDiv>
  <button id='previousButton'>
    <span class="material-symbols-outlined">
      chevron_left
    </span>
  </button>
  <span id='countCharacter'>  </span>
    <button id='nextButton'>
      <span class="material-symbols-outlined">
        chevron_right
      </span>
    </button>
</div>`
}

document.getElementById('buttonDiv').innerHTML = buttonString()

//----------------------- select button click -----------------------
document.getElementById('buttonDiv').addEventListener('click', function (e) {
  let searchedName = ''
  let index = -1
  let allP = document.querySelectorAll('p')
  let pArray = [...allP]
  let allPWithCharacter = pArray.filter(function (item) {
    return item.classList.contains('personItem')
  })
  let numberOfCharacters = allPWithCharacter.length

  for (let i = 0; i < numberOfCharacters; i++) {
    if (allPWithCharacter[i].classList.contains('selectedCharacter')) {
      allPWithCharacter[i].classList.remove('selectedCharacter')
      if (e.target.innerText == 'chevron_left' && i > 0) {
        allPWithCharacter[i - 1].classList.add('selectedCharacter')
        searchedName = allPWithCharacter[i - 1].innerText
        index = i - 1
      } else if (
        e.target.innerText == 'chevron_right' &&
        i < allPWithCharacter.length - 1
      ) {
        allPWithCharacter[i + 1].classList.add('selectedCharacter')
        searchedName = allPWithCharacter[i + 1].innerText
        index = i + 1
        break
      }
    }
  }
  if (searchedName !== null && searchedName.length > 0) {
    let clickedPerson = peopleInStarWars.find(p => p.name == searchedName)
    let personAsString = getDetailsInformation(clickedPerson)
    document.getElementById('detailSection').innerHTML = personAsString
    document.getElementById('countCharacter').innerText = `${
      index + 1
    } / ${numberOfCharacters}`
  }
})

//----------------------- RIGHT PANEL -----------------------
function nth_occurrence (string, char, nth) {
  var first_index = string.indexOf(char)
  var length_up_to_first_index = first_index + 1

  if (nth == 1) {
    return first_index
  } else {
    var string_after_first_occurrence = string.slice(length_up_to_first_index)
    var next_occurrence = nth_occurrence(
      string_after_first_occurrence,
      char,
      nth - 1
    )

    if (next_occurrence === -1) {
      return -1
    } else {
      return length_up_to_first_index + next_occurrence
    }
  }
}

//Get person information
function getPersonData (clickedPerson) {
  if (clickedPerson.species.length !== 0) {
    const lastPerIndex = clickedPerson.species[0].lastIndexOf('/')
    let speciesId = clickedPerson.species[0].charAt(lastPerIndex - 1)

    const getSpeciesPromise = async speciesId => {
      try {
        showLoader()
        const response = await fetch(
          `https://swapi.dev/api/species/${speciesId}`
        )
        return await response.json()
      } catch (err) {
        console.log(err)
      } finally {
        hideLoader()
      }
    }

    getSpeciesPromise(speciesId).then(function (result) {
      localStorage.setItem('name', result.name)
    })

    hideLoader()
  } else localStorage.setItem('name', 'n/a')
}

//Get planet information
function getPlanetData (clickedPerson) {
  const almostLastIndex = nth_occurrence(clickedPerson.homeworld, '/', 5)
  const lastPerIndex = nth_occurrence(clickedPerson.homeworld, '/', 6)

  let planetId = clickedPerson.homeworld.substring(
    almostLastIndex + 1,
    lastPerIndex
  )

  const getHomePlanetPromise = async planetId => {
    try {
      showLoader()
      const response = await fetch(`https://swapi.dev/api/planets/${planetId}`)
      return await response.json()
    } catch (err) {
      console.log(err)
    } finally {
      hideLoader()
    }
  }

  getHomePlanetPromise(planetId).then(function (result) {
    localStorage.setItem('planet', JSON.stringify(result))
  })
}

//All information together -> make html
function getDetailsInformation (clickedPerson) {
  getPersonData(clickedPerson)
  let specie = localStorage.getItem('name')

  getPlanetData(clickedPerson)
  let storedPlanet = localStorage.getItem('planet')
  let planetItem = JSON.parse(storedPlanet)

  return `<div id='personDetailsDiv'>
  <h2>Details</h2>
  <h3>${clickedPerson.name}</h3>
  <p class="personDetails">Height: ${clickedPerson.height}cm</p>
  <p class="personDetails">Mass: ${clickedPerson.mass}kg</p>
  <p class="personDetails">Hair color: ${clickedPerson.hair_color}</p>
  <p class="personDetails">Skin color: ${clickedPerson.skin_color}</p>
  <p class="personDetails">Eye color: ${clickedPerson.eye_color}</p>
  <p class="personDetails">Birth year: ${clickedPerson.birth_year}</p>
  <p class="personDetails">Species: ${specie}</p> 
  <p class="personDetails">Gender: ${clickedPerson.gender}</p>
</div>
<div id="planetDetailsDiv">
  <h3>${planetItem.name}</h3>
  <p class="personDetails">Rotation period: ${planetItem.rotation_period}h</p>
  <p class="personDetails">Orbital period: ${planetItem.orbital_period}days</p>
  <p class="personDetails">Diameter: ${planetItem.diameter}km</p>
  <p class="personDetails">Climate: ${planetItem.climate}</p>
  <p class="personDetails">Gravity: ${planetItem.gravity}</p>
  <p class="personDetails">Terrain: ${planetItem.terrain}</p>
  <p class="personDetails">Population: ${planetItem.population}</p>
</div>`
}

//show all information in div
function getDetails (e) {
  const clickedPerson = peopleInStarWars.find(p => p.name == e.target.innerText)
  let personAsString = getDetailsInformation(clickedPerson)
  document.getElementById('detailSection').innerHTML = personAsString
}

//----------------------- loader -----------------------
function showLoader () {
  document.getElementById('loaderDiv').classList.add('loader')
}
function hideLoader () {
  document.getElementById('loaderDiv').classList.remove('loader')
  document.getElementById('loaderDiv').style.display = 'none'
}
