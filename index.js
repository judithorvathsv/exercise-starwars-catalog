const peopleInStarWars = []
let loader = document.getElementById('loaderDiv')
let specieNameString = ''

const allStarwars = async () => {
  try {
    showLoader(loader)
    const response = await fetch('https://swapi.dev/api/people/')
    return await response.json()
  } catch (err) {
    console.log(err)
  } finally {
    hideLoader(loader)
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

      document.getElementById('countCharacter').innerText = `${
        selectedItemIndex + 1
      } / ${numberOfCharacters}`

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
document
  .getElementById('buttonDiv')
  .addEventListener('click', async function (e) {
    //get clicked item and add classList
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
    //get details and show all information in div
    if (searchedName !== null && searchedName.length > 0) {
      let clickedPerson = peopleInStarWars.find(p => p.name == searchedName)
      let personAsString = await getDetailsInformation(clickedPerson)
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

//fetch species
const getSpeciesPromise = async speciesId => {
  try {
    showLoaderRigthPanel(loader)
    console.log('loading?')
    const response = await fetch(`https://swapi.dev/api/species/${speciesId}`)
    return await response.json()
  } catch (err) {
    console.log(err)
  } finally {
    hideLoaderRightPanel(loader)
  }
}

//fetch planets
const getHomePlanetPromise = async planetId => {
  try {
    showLoaderRigthPanel(loader)
    const response = await fetch(`https://swapi.dev/api/planets/${planetId}`)
    return await response.json()
  } catch (err) {
    console.log(err)
  } finally {
    hideLoaderRightPanel(loader)
  }
}

//All information together -> make html
async function getDetailsInformation (clickedPerson) {
  //specie
  let specie = ''
  if (
    clickedPerson.species === undefined ||
    clickedPerson.species.length == 0
  ) {
    specie = 'n/a'
  } else {
    const lastPerIndex = clickedPerson.species[0].lastIndexOf('/')
    let speciesId = clickedPerson.species[0].charAt(lastPerIndex - 1)
    let specieObj = await getSpeciesPromise(speciesId)
    specie = specieObj.name
  }

  //planet
  const almostLastIndexPlanet = nth_occurrence(clickedPerson.homeworld, '/', 5)
  const lastPerIndexPlanet = nth_occurrence(clickedPerson.homeworld, '/', 6)
  let planetId = clickedPerson.homeworld.substring(
    almostLastIndexPlanet + 1,
    lastPerIndexPlanet
  )
  let planetItem = await getHomePlanetPromise(planetId)

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
async function getDetails (e) {
  const clickedPersonObj = peopleInStarWars.find(
    p => p.name == e.target.innerText
  )
  let personAsString = await getDetailsInformation(clickedPersonObj)
  document.getElementById('detailSection').innerHTML = personAsString
}

//----------------------- loader -----------------------

function showLoader (loader) {
  loader.classList.add('loader')
  document.getElementById('main').style.opacity = 0
}

function showLoaderRigthPanel (loader) {
  document.getElementById(
    'detailSection'
  ).innerHTML = `<div id='loaderDiv' class='loader miniLoader'></div>`
  loader.classList.add('loader')
}

function hideLoader (loader) {
  loader.classList.remove('loader')
  loader.style.display = 'none'
  document.getElementById('main').style.opacity = 1
}

function hideLoaderRightPanel (loader) {
  loader.classList.remove('loader')
  loader.style.display = 'none'
}
