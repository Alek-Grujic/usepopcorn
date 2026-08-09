import { useEffect } from "react";

export function useKey(key, action) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.code === key) {
        action(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return function () {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [action, key]);
}
