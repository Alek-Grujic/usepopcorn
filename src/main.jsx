import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
// import "./index.css";
// import App from "./App.jsx";

// import StarRating from "./StarRating";
import ShowMore from "./ShowMore";

// function Test() {
//   const [movieRating, setMovieRating] = useState(0);
//   return (
//     <div>
//       <StarRating color="blue" maxRating={10} onSetRating={setMovieRating} />
//       <p>This movie was rated {movieRating} stars</p>
//     </div>
//   );
// }

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <App /> */}
    {/* <StarRating maxRating={10} />
    <StarRating size={32} color="red" />
    <Test /> */}
    <ShowMore />
  </StrictMode>,
);
