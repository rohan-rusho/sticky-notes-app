/* ==========================================================================
   STICKY NOTES APP — app logic
   Add / edit / delete notes, one color per note, search filter.
   Notes persist in localStorage.
   ========================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "sticky-notes-app:v1";
  var COLORS = ["yellow", "pink", "green", "blue", "purple", "orange"];

  var gridEl = document.getElementById("notes-grid");
  var emptyEl = document.getElementById("notes-empty");
  var searchEmptyEl = document.getElementById("search-empty");
  var countEl = document.getElementById("note-count");
  var searchInput = document.getElementById("search-input");
  var newNoteText = document.getElementById("new-note-text");
  var addBtn = document.getElementById("add-note-btn");
  var toastEl = document.getElementById("toast");
  var header = document.getElementById("site-header");
  var navToggle = document.getElementById("nav-toggle");
  var mobileMenu = document.getElementById("mobile-menu");

  var notes = loadNotes();
  var selectedColor = "yellow";
  var searchQuery = "";
  var toastTimer = null;

  /* ---------- Storage ---------- */

  function loadNotes() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (n) {
        return n && typeof n.id === "string" && typeof n.text === "string";
      }).map(function (n) {
        return {
          id: n.id,
          text: n.text,
          color: COLORS.indexOf(n.color) !== -1 ? n.color : "yellow",
          createdAt: typeof n.createdAt === "number" ? n.createdAt : Date.now()
        };
      });
    } catch (e) {
      return [];
    }
  }

  function saveNotes() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      showToast("Couldn't save — browser storage is full or blocked");
    }
  }

  function makeId() {
    return "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ---------- Actions ---------- */

  function addNote() {
    var text = newNoteText.value.trim();
    if (!text) {
      showToast("Write something first");
      newNoteText.focus();
      return;
    }
    notes.unshift({ id: makeId(), text: text, color: selectedColor, createdAt: Date.now() });
    saveNotes();
    newNoteText.value = "";
    render();
    showToast("Note added");
  }

  function deleteNote(id) {
    notes = notes.filter(function (n) { return n.id !== id; });
    saveNotes();
    render();
    showToast("Note deleted");
  }

  function updateNoteText(id, text) {
    var note = notes.find(function (n) { return n.id === id; });
    if (!note) return;
    note.text = text;
    saveNotes();
  }

  function setNoteColor(id, color) {
    var note = notes.find(function (n) { return n.id === id; });
    if (!note) return;
    note.color = color;
    saveNotes();
    render();
  }

  function formatDate(ts) {
    var d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
      " · " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  /* ---------- Rendering ---------- */

  function visibleNotes() {
    var q = searchQuery.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(function (n) { return n.text.toLowerCase().indexOf(q) !== -1; });
  }

  function render() {
    var list = visibleNotes();
    gridEl.innerHTML = "";

    emptyEl.classList.toggle("hidden", notes.length !== 0);
    searchEmptyEl.classList.toggle("hidden", !(notes.length > 0 && list.length === 0));

    countEl.textContent = notes.length === 0
      ? "No notes yet"
      : notes.length + (notes.length === 1 ? " note" : " notes") +
        (searchQuery.trim() ? " · " + list.length + " shown" : "");

    list.forEach(function (note) {
      var card = document.createElement("article");
      card.className = "note-card";
      card.setAttribute("data-color", note.color);

      var textEl = document.createElement("p");
      textEl.className = "note-text";
      textEl.textContent = note.text;
      textEl.contentEditable = "true";
      textEl.spellcheck = true;
      textEl.setAttribute("aria-label", "Note text. Click to edit.");
      textEl.setAttribute("role", "textbox");
      textEl.addEventListener("blur", function () {
        var newText = textEl.textContent.trim();
        if (!newText) {
          textEl.textContent = note.text; // don't allow empty notes
          showToast("A note can't be empty");
          return;
        }
        if (newText !== note.text) {
          updateNoteText(note.id, newText);
          showToast("Note saved");
        }
      });
      textEl.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { e.preventDefault(); textEl.blur(); }
      });
      card.appendChild(textEl);

      var meta = document.createElement("div");
      meta.className = "note-meta";

      var dateEl = document.createElement("span");
      dateEl.className = "note-date";
      dateEl.textContent = formatDate(note.createdAt);
      meta.appendChild(dateEl);

      var actions = document.createElement("div");
      actions.className = "note-actions";

      var dots = document.createElement("div");
      dots.className = "note-color-dots";
      dots.setAttribute("role", "group");
      dots.setAttribute("aria-label", "Change note color");
      COLORS.forEach(function (color) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "color-dot" + (color === note.color ? " active" : "");
        dot.setAttribute("data-color", color);
        dot.setAttribute("aria-label", "Make this note " + color);
        dot.setAttribute("aria-pressed", color === note.color ? "true" : "false");
        dot.addEventListener("click", function () { setNoteColor(note.id, color); });
        dots.appendChild(dot);
      });
      actions.appendChild(dots);

      var del = document.createElement("button");
      del.type = "button";
      del.className = "delete-btn";
      del.textContent = "✕";
      del.setAttribute("aria-label", "Delete note");
      del.addEventListener("click", function () { deleteNote(note.id); });
      actions.appendChild(del);

      meta.appendChild(actions);
      card.appendChild(meta);
      gridEl.appendChild(card);
    });
  }

  /* ---------- Toast ---------- */

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------- Wire up ---------- */

  addBtn.addEventListener("click", addNote);
  newNoteText.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      addNote();
    }
  });

  searchInput.addEventListener("input", function () {
    searchQuery = searchInput.value;
    render();
  });

  document.querySelectorAll(".composer .color-dot").forEach(function (dot) {
    dot.addEventListener("click", function () {
      selectedColor = dot.getAttribute("data-color");
      document.querySelectorAll(".composer .color-dot").forEach(function (d) {
        var active = d === dot;
        d.classList.toggle("active", active);
        d.setAttribute("aria-pressed", active ? "true" : "false");
      });
    });
  });

  window.addEventListener("scroll", function () {
    header.classList.toggle("scrolled", window.scrollY > 8);
  }, { passive: true });

  navToggle.addEventListener("click", function () {
    var open = mobileMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  mobileMenu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      mobileMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  document.getElementById("year").textContent = new Date().getFullYear();

  render();
})();
