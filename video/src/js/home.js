(async function load (){
  
  const proxyurl = "https://cors-anywhere.herokuapp.com/"

  async function getData(url){
    const response = await fetch(proxyurl + url)
    const data = await response.json()

    if(data.data.movie_count > 0){
      return data
    }else{
      throw new Error('No se encontró ningun resultado')
    }
  }

  async function getDataUser(url){
    const response = await fetch(url)
    const dataUser = await response.json()
    return dataUser
  }

  const $form = document.getElementById('form')
  const $home = document.getElementById('home')
  const $featuringContainer = document.getElementById('featuring')

  const setAttributes = ($element, attributes) => {
    for (const attribute in attributes){
      $element.setAttribute(attribute, attributes[attribute])
    }
  }

  const BASE_API = 'https://yts.am/api/v2/'

  const featuringTemplate = (peli) => {
    return (
      `
   <div class="featuring">
    <div class="featuring-image">
      <img src="${peli.medium_cover_image}" width="70" height="100" alt="">
    </div>
    <div class="featuring-content">
      <p class="featuring-title">Pelicula encontrada</p>
      <p class="featuring-album">${peli.title}</p>
    </div>
   </div>
      `
    )
  }

  $form.addEventListener('submit', async (event) => {
    event.preventDefault()
    $home.classList.add('search-active')
    const $loader = document.createElement('img')
    setAttributes($loader, {
      src: 'src/images/loader.gif',
      height: 50,
      width: 50
    })
    $featuringContainer.append($loader)

    const data = new FormData($form)
    try{
      const {data: {movies: pelis}} = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`)
      const HMTLstr = featuringTemplate(pelis[0])
      $featuringContainer.innerHTML = HTMLstr
    }catch(error){
      alert(error.message)
      $loader.remove()
      $home.classList.remove('search-active')
    }
  })

  const videoItemTemplate = (movie, category) => {
    return(
      `<div class="primaryPlaylistItem" data-id="${movie.id}" data-category="${category}">
        <div class="primaryPlaylistItem-image">
          <img src="${movie.medium_cover_image}">
        </div>
        <h4 class="primaryPlaylistItem-title">
          ${movie.title}
        </h4>
      </div>`
    )
  }

  const createTemplate = (HTMLstr) => {
    const html = document.implementation.createHTMLDocument()
    html.body.innerHTML = HTMLstr
    return html.body.children[0]
  }

  async function getUser(url) {
    const response = await fetch(url)
    const data = await response.json()
    return data
  }

  const renderMovieList = (list, $container, category) => {
    $container.children[0].remove()
    list.forEach(movie => {
      const HTMLstr = videoItemTemplate (movie, category)
      const movieElement = createTemplate(HTMLstr)
      $container.append(movieElement)
      const img = movieElement.querySelector('img')
      img.addEventListener('load', () => {
        event.srcElement.classList.add('fadeIn')
      })
      addEventClick(movieElement)
    })
  }

  function userItemTemplate(user) {
    return (
      `
      <li class="playlistFriends-item">
        <a href="">
          <img class="playlist-friend-image" width="100" src="${user.picture.thumbnail}" alt="">
          <span class="playlist-friend-name">${user.name.first} ${user.name.last}</span>
        </a>
      </li>
      `
    )
  }

  function playlistItemplate(movie) {
    return (
      `
      <li class="myPlaylist-item">
        <a class="playlist-item" href="#">
          <span>${movie.title}</span>
        </a>
      </li>
      `
    )
  }

  const renderUserList = (list, $container) => {
    list.forEach((movie) => {
        const HTMLString = userItemTemplate(movie)
        const playlistElement = createTemplate(HTMLString)
        $container.append(playlistElement)
    })
  }
  
  function renderPlaylist(list, $container) {
    list.forEach((user) => {
      const HTMLString = playlistItemplate(user)
      const userElement = createTemplate(HTMLString)
      $container.append(userElement)
    })
  }

  

  const addEventClick = ($element) => {
    $element.addEventListener('click', () => {
      showModal($element)
    })
  }

    async function cacheExist (category) {
    const listName = `${category}List`
    const cacheList = localStorage.getItem(listName)
    if(cacheList){
      return JSON.parse(cacheList)
    }
    const {data: {movies: data}} = await getData(`${BASE_API}list_movies.json?genre=${category}`)
    localStorage.setItem(listName, JSON.stringify(data))

    return data
  }

  async function cacheExistMovies () {
    const listName = 'fantasyList'
    const cacheList = localStorage.getItem(listName)
    if(cacheList){
      return JSON.parse(cacheList)
    }
    const {data: {movies: data}} = await getData(`${BASE_API}list_movies.json?genre=fantasy&limit=10`)
    localStorage.setItem(listName, JSON.stringify(data))

    return data
  }

  async function cacheExistFriends () {
    const listName = 'userList'
    const cacheList = localStorage.getItem(listName)
    if(cacheList){
      return JSON.parse(cacheList)
    }
    const {results: dataUser} = await getDataUser(`https://randomuser.me/api/?results=10`)
    localStorage.setItem(listName, JSON.stringify(dataUser))

    return dataUser
  }

  const fantasyList = await cacheExistMovies()
  $playListContainer = document.querySelector('.myPlaylist')
  renderPlaylist(fantasyList, $playListContainer)

  const userList = await cacheExistFriends()
  const $userContainer = document.querySelector('ul')
  renderUserList(userList, $userContainer)

  const actionList = await cacheExist('action')
  const $actionContainer = document.getElementById('action')
  renderMovieList(actionList, $actionContainer, 'action')
  
  const dramaList = await cacheExist('drama')
  const $dramaContainer = document.getElementById('drama')
  renderMovieList(dramaList, $dramaContainer, 'drama')
  
  const animationList = await cacheExist('animation')
  const $animationContainer = document.getElementById('animation')
  renderMovieList(animationList, $animationContainer, 'animation')

  const $modal = document.getElementById('modal')
  const $overlay = document.getElementById('overlay')
  const $hideModal = document.getElementById('hide-modal')
  
  const $modalTitle = $modal.querySelector('h1')
  const $modalImage = $modal.querySelector('img')
  const $modalDescription = $modal.querySelector('p')

  const findById = (list, id) => list.find(movie => movie.id === parseInt(id, 10))

  const findMovie = (id, category) => {
    switch(category){
      case 'action' : return findById(actionList, id)
      case 'drama' : return findById(dramaList, id)
      case 'animation' : return findById(animationList, id)
    }
  }

  const showModal = ($element) => {
    $overlay.classList.add('active')
    $modal.style.animation = 'modalIn .8s forwards'
    const id = $element.dataset.id
    const category = $element.dataset.category
    const data = findMovie(id, category)
    $modalTitle.textContent = data.title
    $modalImage.setAttribute('src', data.medium_cover_image)
    $modalDescription.textContent = data.description_full
  }

  $hideModal.addEventListener('click', () => hideModal())

  const hideModal = () => {
    $modal.style.animation = 'modalOut .8s forwards'
    $overlay.classList.remove('active')
  }
})()