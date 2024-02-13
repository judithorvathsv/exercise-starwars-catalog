let peopleInStarWars = []
let loader = document.getElementById('loaderDiv')
let page = 1

//store characters in localStorage
window.onload = () => {
  let storedCharacters = localStorage.getItem('storedPeopleInStarWars')
  if (storedCharacters == 'undefined' || storedCharacters == null) {
    getPeople()
  } else {
    peopleInStarWars = JSON.parse(
      localStorage.getItem('storedPeopleInStarWars')
    )
  }
}

//----------------------- LEFT PANEL -----------------------

//add 'Characters' title
let h2 = document.createElement('h2')
document.getElementById('peopleUl').appendChild(h2)
h2.innerText = 'Characters'
h2.classList.add('characterTitle')

//set navigation buttons at the bottom of the page
let buttonString = function addButtons () {
  return `
  <div id = buttonDiv>
  <button id='previousButton'>
    <span class="material-symbols-outlined">chevron_left</span>
  </button>
  <span id='countCharacter'>  </span>
    <button id='nextButton'>
      <span class="material-symbols-outlined">chevron_right</span>
    </button>
</div>`
}

document.getElementById('buttonDiv').innerHTML = buttonString()

//show navigation buttons at the bottom of the page
function showPagingNumber () {
  document.getElementById('countCharacter').innerText = `${page} / 9`
}
showPagingNumber()

//get all characters from api
const getPeople = async () => {
  try {
    showLoader(loader)
    const url = 'https://swapi.py4e.com/api/people/'
    const res = await fetch(url)

    const { count, results } = await res.json()
    if (count === 0) return []
    const pageLength = results.length
    const pages = [
      results, // first page
      ...(await Promise.all(
        [
          // -1 because first page already fetched
          ...new Array(Math.ceil(count / pageLength) - 1).keys()
        ].map(async n => {
          // +1 because zero-indexed
          // +1 because first page already fetched
          const page = n + 2
          const res = await fetch(`${url}?page=${page}`)
          return (await res.json()).results
        })
      ))
    ]

    let resultFromFetch = pages.flat()
    peopleInStarWars = resultFromFetch
    localStorage.setItem(
      'storedPeopleInStarWars',
      JSON.stringify(peopleInStarWars)
    )

    return resultFromFetch
  } catch (err) {
    console.log(err)
  } finally {
    hideLoader(loader)
  }
}

//show character's list
let removeCharactersFromPreviousPage = () => {
  document.getElementById('peopleUl').innerHTML = ''

  let h2 = document.createElement('h2')
  document.getElementById('peopleUl').appendChild(h2)
  h2.innerText = 'Characters'
  h2.classList.add('characterTitle')
}

let showCharactersForOnePage = async page => {
  let firstCharacterOnPage = page * 10 - 10
  let lastCharacterOnPage = page * 10
  removeCharactersFromPreviousPage()

  if (peopleInStarWars.length == 0) {
    peopleInStarWars = await getPeople()
  }

  peopleInStarWars
    .slice(firstCharacterOnPage, lastCharacterOnPage)
    .map(function (person) {
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
      })
    })
}

showCharactersForOnePage(page)

//-----------------------  paging button click -----------------------
document
  .getElementById('buttonDiv')
  .addEventListener('click', async function (e) {
    let clickedButton = e.target
    let parent = clickedButton.parentElement

    if (parent.id == 'previousButton' && page > 1) {
      page--
    }
    if (parent.id == 'nextButton' && page < 9) {
      page++
    }
    document.getElementById('countCharacter').innerText = `${page} / 9`

    //get characters for that page number
    showCharactersForOnePage(page)
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
  for (let i = 0; i < peopleInStarWars.length; i++) {
    if (peopleInStarWars[i].name === e.target.innerText) {
      let personAsString = await getDetailsInformation(peopleInStarWars[i])
      document.getElementById('detailSection').innerHTML = personAsString
      break
    }
  }
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
