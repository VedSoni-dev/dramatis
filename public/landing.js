// The landing's one form: a character idea in one line. The app's writer (/app/new?draft=1) reads the idea from
// sessionStorage, the same hand-off /app uses, so nothing about the idea goes into the URL.
const form = document.querySelector("[data-idea]");
if (form) {
  const input = form.querySelector("input");
  const hint = form.querySelector("[data-idea-hint]");
  const said = hint ? hint.textContent : "";
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const idea = (input.value || "").replace(/\s+/g, " ").trim();
    if (idea.length < 3) {
      input.setAttribute("aria-invalid", "true");
      if (hint) { hint.textContent = "Describe them in a few words first, like “a pirate who is afraid of water”."; hint.classList.add("is-error"); }
      input.focus();
      return;
    }
    input.removeAttribute("aria-invalid");
    if (hint) { hint.textContent = said; hint.classList.remove("is-error"); }
    try { sessionStorage.setItem("dramatis.idea", idea); } catch { /* private mode: the writer opens empty */ }
    location.href = "/app/new?draft=1";
  });
  input.addEventListener("input", () => { if (input.getAttribute("aria-invalid")) { input.removeAttribute("aria-invalid"); if (hint) { hint.textContent = said; hint.classList.remove("is-error"); } } });
  if (hint) { hint.id = "idea-hint"; input.setAttribute("aria-describedby", "idea-hint"); }
}
