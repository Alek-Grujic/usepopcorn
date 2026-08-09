import { use, useEffect, useState, useRef } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorage } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "860f7d99";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const { movies, isLoading, error } = useMovies(query);
  const [watched, setWatched] = useLocalStorage([], "watched");

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched((previousWatched) =>
      previousWatched.filter((mov) => mov.imdbID !== id),
    );
  }

  function handleUpdateRating(update) {
    setWatched((updated) =>
      updated.map((up) => {
        return up.imdbID === selectedMovie ? { ...up, userRating: update } : up;
      }),
    );
  }

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResult movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} setSelectedMovie={setSelectedMovie} />
          )}{" "}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedMovie ? (
            <SelectedMovie
              selectedMovie={selectedMovie}
              setSelectedMovie={setSelectedMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
              onDeleteWatched={handleDeleteWatched}
              onUpdateRating={handleUpdateRating}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedList
                watched={watched}
                setSelectedMovie={setSelectedMovie}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>❌</span> {message}
    </p>
  );
}

// Nav bar ////////////////////////////////
function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

// Nav bar components
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useEffect(function () {
    console.log(inputEl.current);
    inputEl.current.focus();
  }, []);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
////////////////////////////////

// Main ////////////////////////////////

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, setSelectedMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <li
          key={movie.imdbID}
          onClick={() =>
            setSelectedMovie((selectedId) =>
              movie.imdbID === selectedId ? null : movie.imdbID,
            )
          }
        >
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>🗓</span>
              <span>{movie.Year}</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedList({ watched, setSelectedMovie, onDeleteWatched }) {
  return (
    <ul className="list list-movies">
      {watched.map((movie) => (
        <li
          key={movie.imdbID}
          className="watchedList"
          onClick={() =>
            setSelectedMovie((selectedId) =>
              movie.imdbID === selectedId ? null : movie.imdbID,
            )
          }
        >
          <img src={movie.poster} alt={`${movie.title} poster`} />
          <div>
            <h3>{movie.title}</h3>
            <button
              className="btn-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteWatched(movie.imdbID);
              }}
            >
              X
            </button>
          </div>
          <div>
            <p>
              <span>⭐️</span>
              <span>{movie.imdbRating}</span>
            </p>
            <p>
              <span>🌟</span>
              <span>{movie.userRating}</span>
            </p>
            <p>
              <span>⏳</span>
              <span>{movie.runtime} min</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SelectedMovie({
  selectedMovie,
  setSelectedMovie,
  onAddWatched,
  watched,
  onDeleteWatched,
  onUpdateRating,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const countRef = useRef(0);

  useEffect(
    function () {
      if (userRating) countRef.current = countRef.current + 1;
    },
    [userRating],
  );

  let isWatched = watched.some((sm) => sm.imdbID === selectedMovie);
  let watchedMovie = watched.find((e) => e.imdbID === selectedMovie);

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  useEffect(() => {
    if (!title) return;

    document.title = `Movie | ${title}`;

    return () => {
      document.title = "usePopcorn";
    };
  }, [title]);

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedMovie}`,
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedMovie],
  );

  useKey("Escape", setSelectedMovie);

  // useEffect(() => {
  //   function handleKeyDown(e) {
  //     if (e.code === "Escape") {
  //       setSelectedMovie(null);
  //     }
  //   }

  //   document.addEventListener("keydown", handleKeyDown);

  //   return function () {
  //     document.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, [setSelectedMovie]);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedMovie,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDec: countRef.current,
    };

    onAddWatched(newWatchedMovie);
    setSelectedMovie(null);
  }

  function removeMovie() {
    onDeleteWatched(selectedMovie);
    setSelectedMovie(null);
  }

  function handleUpdate() {
    // const newUpdatedMovie = {
    //   imdbID: selectedMovie,
    //   title,
    //   year,
    //   poster,
    //   imdbRating: Number(imdbRating),
    //   runtime: Number(runtime.split(" ").at(0)),
    //   userRating,
    // };

    onUpdateRating(userRating);
  }

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={() => setSelectedMovie(null)}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} Imdbrating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                    userRating={watchedMovie.userRating}
                  />
                  <>
                    <button className="btn-add-remove" onClick={removeMovie}>
                      Already added - remove
                    </button>
                    <button className="btn-add-remove" onClick={handleUpdate}>
                      Change rating
                    </button>
                  </>
                </>
              ) : (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

////////////////////////////////
