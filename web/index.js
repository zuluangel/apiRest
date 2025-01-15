function fetchingMovies(){
  fetch('http://localhost:3000/movies')
  .then(res => res.json())
  .then(movies => {
    const html = movies.map(movie =>{
      return `
        <article data-id="${movie.id}">
          <h2>${movie.title}</h2>
          <img src="${movie.poster}" alt="${movie.title}">
          <p>${movie.year}</p>
          <button>Delete Movie</button>
        </article>        
      `
    }).join('');
    document.querySelector('main').innerHTML = html;
    document.addEventListener('click', e => {
      if(e.target.matches('button')){
        const article = e.target.closest('article');
        const id = article.dataset.id;
        
        fetch(`http://localhost:3000/movies/${id}`, {
          method: 'DELETE',
        })
        .then(res => {
          if(res.ok){
            article.remove();
          }
        })
      }
    })
  })
}

window.onload = fetchingMovies;
