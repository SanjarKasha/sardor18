const form = document.getElementById("nameForm");
const input = document.getElementById("nameInput");
const results = document.getElementById("results");

const toggleVisual = document.getElementById("toggleVisual");
const toggleDot = document.getElementById("toggleDot");

if (localStorage.getItem("dark") === "true") {
  document.documentElement.classList.add("dark");
  toggleVisual.classList.add("bg-green-600");
  toggleDot.style.transform = "translateX(16px)";
}



function pct(prob) {
  return (prob * 100).toFixed(1) + "%";
}
function flagUrl(cc) {
  return `https://flagcdn.com/w40/${cc.toLowerCase()}.png`;
}
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
function countryName(cc) {
  try {
    return regionNames.of(cc) || cc;
  } catch (e) {
    return cc;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = input.value.trim();
  if (!name) return;

  results.innerHTML = '<li class="text-center">Searching...</li>';

  try {
    const res = await fetch(
      `https://api.nationalize.io?name=${encodeURIComponent(name)}`
    );
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();
    const list = (data.country || [])
      .slice()
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);

    results.innerHTML = "";
    if (list.length === 0) {
      results.innerHTML =
        '<li class="text-center opacity-70">No results found.</li>';
      return;
    }

    list.forEach((item, idx) => {
      const cc = item.country_id;
      const prob = item.probability || 0;

      const li = document.createElement("li");
      li.className =
        "flex items-center gap-4 p-3 rounded-md bg-white dark:bg-gray-800/20 shadow-sm";

      const rank = document.createElement("div");
      rank.className = "w-6 font-semibold text-gray-600 dark:text-gray-300";
      rank.textContent = idx + 1 + ".";

      const flag = document.createElement("img");
      flag.className = "flag-img rounded-sm shadow-sm";
      flag.alt = cc;
      flag.src = flagUrl(cc);

      const center = document.createElement("div");
      center.className = "flex-1 min-w-0";

      const title = document.createElement("div");
      title.className = "font-medium truncate";
      title.textContent = countryName(cc);

      const sub = document.createElement("div");
      sub.className = "text-xs text-gray-500 dark:text-gray-400 truncate";
      sub.textContent = `${cc} • ${pct(prob)}`;

      center.appendChild(title);
      center.appendChild(sub);

      const barWrap = document.createElement("div");
      barWrap.className =
        "w-36 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden";
      const bar = document.createElement("div");
      bar.className = "h-full rounded-full transition-all";
      bar.style.width = prob * 100 + "%";
      bar.style.background = "linear-gradient(90deg,#059669,#10b981)";
      barWrap.appendChild(bar);

      const right = document.createElement("div");
      right.className = "w-14 text-right font-semibold";
      right.textContent = pct(prob);

      li.appendChild(rank);
      li.appendChild(flag);
      li.appendChild(center);
      li.appendChild(barWrap);
      li.appendChild(right);

      results.appendChild(li);
    });
  } catch (err) {
    results.innerHTML = `<li class="text-center text-red-500">Error: ${err.message}</li>`;
    console.error(err);
  }
});
