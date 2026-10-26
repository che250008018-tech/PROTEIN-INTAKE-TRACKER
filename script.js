// FORM / FUEL - Protein Tracker

const $ = id => document.getElementById(id);
const KEY = "proteinTrackStateV1";

const foods = [
  {id:"eggs",name:"Eggs",emoji:"🥚",unit:"eggs",protein:6},
  {id:"chicken",name:"Chicken",emoji:"🍗",unit:"100 g",protein:31},
  {id:"paneer",name:"Paneer",emoji:"🧀",unit:"100 g",protein:18},
  {id:"dal",name:"Cooked dal",emoji:"🥣",unit:"cups",protein:9},
  {id:"milk",name:"Milk",emoji:"🥛",unit:"cups",protein:8},
  {id:"curd",name:"Curd",emoji:"🥣",unit:"100 g",protein:4},
  {id:"tofu",name:"Tofu",emoji:"🧊",unit:"100 g",protein:8},
  {id:"chickpeas",name:"Chickpeas",emoji:"🫘",unit:"cups",protein:15},
  {id:"peanuts",name:"Peanuts",emoji:"🥜",unit:"30 g portions",protein:7},
  {id:"oats",name:"Oats",emoji:"🌾",unit:"40 g portions",protein:5},
  {id:"fish",name:"Fish",emoji:"🐟",unit:"100 g",protein:22},
  {id:"soy",name:"Soy chunks",emoji:"🌱",unit:"30 g portions",protein:16},
  {id:"yogurt",name:"Greek yogurt",emoji:"🥛",unit:"cups",protein:17},
  {id:"whey",name:"Whey protein",emoji:"🥤",unit:"scoops",protein:24}
];

// Load saved data or create a new profile.
function loadData() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    if (data?.profile && Array.isArray(data.entries)) return data;
  } catch (error) {
    console.log("Starting fresh.");
  }

  return {
    profile: {name:"", weight:80, goal:120},
    entries: []
  };
}

let state = loadData();

const save = () =>
  localStorage.setItem(KEY, JSON.stringify(state));

const goal = () => Number(state.profile.goal) || 120;

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function dateAgo(days) {
  const d = new Date();
  d.setDate(d.getDate()-days);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function totalOn(date) {
  return state.entries
    .filter(e => e.date === date)
    .reduce((sum,e) => sum + Number(e.protein),0);
}

function notify(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"),2200);
}

// Fill the food menu and quick-add buttons.
function renderFoodChoices() {
  $("foodSelect").innerHTML =
    foods.map(f => `<option value="${f.id}">${f.emoji} ${f.name} — ${f.protein} g / portion</option>`).join("") +
    `<option value="custom">＋ Custom food</option>`;

  $("quickFoods").innerHTML = foods.slice(0,6).map(f => `
    <button class="quick-food" data-quick="${f.id}" type="button">
      <span class="food-emoji">${f.emoji}</span>
      <span class="quick-food-copy">
        <strong>${f.name}</strong>
        <small>${f.protein} g protein</small>
      </span>
      <span class="add-circle">+</span>
    </button>
  `).join("");

  updateFoodFields();
}

function updateFoodFields() {
  const food = foods.find(f => f.id === $("foodSelect").value);

  $("customFoodFields").classList.toggle("hidden",!!food);
  $("proteinInput").value = food ? food.protein : "";
  $("foodHint").textContent = food
    ? `Estimate: ${food.protein} g per portion.`
    : "Enter a custom food and its protein amount.";

  updateHint();
}

function updateHint() {
  const total = Number($("quantity").value) *
                Number($("proteinInput").value);

  if ($("proteinInput").value !== "") {
    $("foodHint").textContent =
      `This entry adds about ${Math.round(total*10)/10} g protein.`;
  }
}

// Add a food and calculate its protein.
function addFood(name,quantity,unit,proteinEach) {
  state.entries.push({
    id: Date.now().toString(),
    name,
    quantity,
    unit,
    protein: Math.round(quantity*proteinEach*10)/10,
    date: today(),
    time: new Date().toLocaleTimeString([], {
      hour:"2-digit", minute:"2-digit"
    })
  });

  save();
  renderAll();
  notify(`${name} added to today's log.`);
}

// Update today's total, progress ring and food list.
function renderDashboard() {
  const amount = totalOn(today());
  const percent = Math.round(amount/goal()*100);

  $("heroIntake").textContent = Math.round(amount*10)/10;
  $("heroGoal").textContent = goal();
  $("ringPercent").innerHTML = `${percent}<span>%</span>`;

  $("progressRing").style.setProperty(
    "--progress", `${Math.min(100,percent)}%`
  );

  $("heroMeterFill").style.width =
    `${Math.min(100,percent)}%`;

  $("heroFootnote").textContent = amount >= goal()
    ? "Daily target reached. Great work!"
    : `${Math.round((goal()-amount)*10)/10} g left to reach your target`;

  const entries = state.entries
    .filter(e => e.date === today())
    .slice().reverse();

  $("entryCount").textContent = `${entries.length} ENTRIES`;
  $("todayEmpty").classList.toggle("hidden",entries.length > 0);

  $("todayLogBody").innerHTML = entries.map(e => `
    <tr>
      <td>${e.name}<small>${e.time || "Today"}</small></td>
      <td>${e.quantity} ${e.unit}</td>
      <td><span class="protein-value">${e.protein} g</span></td>
      <td>
        <button class="icon-action" data-edit="${e.id}">↗</button>
        <button class="icon-action delete" data-delete="${e.id}">×</button>
      </td>
    </tr>
  `).join("");

  // Simple seven-day chart.
  const days = Array.from({length:7},(_,i) => dateAgo(6-i));
  const totals = days.map(totalOn);
  const max = Math.max(goal(),...totals,1)*1.15;

  $("weeklyAverage").innerHTML =
    `${Math.round(totals.reduce((a,b)=>a+b,0)/7)} <small>g</small>`;

  $("weeklyChart").innerHTML = days.map((d,i) => `
    <div class="week-bar-item">
      <div class="week-bar-area">
        <div class="week-bar ${totals[i]>=goal()?"met":""}"
          style="height:${Math.max(2,totals[i]/max*100)}%">
        </div>
      </div>
      <span class="week-bar-label">
        ${new Date(d+"T12:00:00").toLocaleDateString(undefined,{weekday:"short"})}
      </span>
    </div>
  `).join("");
}

// Display searchable foods.
function renderLibrary() {
  const query = $("foodSearch").value.toLowerCase();

  $("foodDatabase").innerHTML = foods
    .filter(f => f.name.toLowerCase().includes(query))
    .map(f => `
      <article class="database-food">
        <span class="food-emoji">${f.emoji}</span>
        <span class="database-food-copy">
          <strong>${f.name}</strong>
          <small>${f.protein} g protein per portion</small>
        </span>
        <button data-add-food="${f.id}">＋ LOG</button>
      </article>
    `).join("");
}

// Switch between the website's four sections.
function showView(name) {
  ["dashboard","foods","history","profile"].forEach(view =>
    $(view+"View").classList.toggle("hidden",view!==name)
  );

  document.querySelectorAll(".nav-link").forEach(button =>
    button.classList.toggle("active",button.dataset.view===name)
  );

  const headings = {
    dashboard:["Build your <em>baseline.</em>","Good habits, one plate at a time."],
    foods:["Find your <em>fuel.</em>","Explore common protein sources."],
    history:["See your <em>rhythm.</em>","Track your progress over time."],
    profile:["Make it <em>yours.</em>","Set your personal target."]
  };

  $("pageTitle").innerHTML = headings[name][0];
  $("pageSubtitle").textContent = headings[name][1];
}

function renderProfile() {
  $("profileName").value = state.profile.name || "";
  $("weight").value = state.profile.weight || 80;
  $("goal").value = goal();

  $("goalFormula").textContent =
    `${$("weight").value} kg × 1.5 = ${Math.round(Number($("weight").value)*1.5)} g`;

  $("profileShortcut").textContent =
    state.profile.name ? state.profile.name[0].toUpperCase() : "F";
}

function renderHistory() {
  const count = Number($("historyRange").value || 7);
  const dates = Array.from({length:count},(_,i)=>dateAgo(count-1-i));

  $("historyBody").innerHTML = dates.slice().reverse().map(d => `
    <tr>
      <td>${d}</td>
      <td>${Math.round(totalOn(d))} g</td>
      <td>${goal()} g</td>
      <td>${Math.round(totalOn(d)/goal()*100)}%</td>
      <td>${totalOn(d)>=goal()?"Target met":"In progress"}</td>
    </tr>
  `).join("");
}

function renderAll() {
  renderDashboard();
  renderLibrary();
  renderHistory();
  renderProfile();
}

// Log food from the main form.
$("foodForm").addEventListener("submit",e => {
  e.preventDefault();

  const food = foods.find(f => f.id === $("foodSelect").value);
  const custom = !food;
  const name = custom ? $("customName").value.trim() : food.name;
  const unit = custom ? $("customUnit").value.trim() : food.unit;
  const quantity = Number($("quantity").value);
  const protein = Number($("proteinInput").value);

  if (!name || quantity<=0 || !unit || protein<0) {
    return notify("Please check your food details.");
  }

  addFood(name,quantity,unit,protein);
  $("quantity").value = 1;
});

$("foodSelect").addEventListener("change",updateFoodFields);
$("quantity").addEventListener("input",updateHint);
$("proteinInput").addEventListener("input",updateHint);
$("foodSearch").addEventListener("input",renderLibrary);
$("historyRange").addEventListener("change",renderHistory);

$("profileForm").addEventListener("submit",e => {
  e.preventDefault();

  state.profile = {
    name:$("profileName").value.trim(),
    weight:Number($("weight").value),
    goal:Number($("goal").value)
  };

  save();
  renderAll();
  showView("profile");
  notify("Settings saved.");
});

$("profileShortcut").addEventListener("click",() => showView("profile"));

document.addEventListener("click",e => {
  const nav = e.target.closest("[data-view], [data-go]");
  if (nav) return showView(nav.dataset.view || nav.dataset.go);

  const button = e.target.closest("[data-quick], [data-add-food]");
  if (button) {
    const food = foods.find(f =>
      f.id === (button.dataset.quick || button.dataset.addFood)
    );
    if (food) addFood(food.name,1,food.unit,food.protein);
  }

  const del = e.target.closest("[data-delete]");
  if (del && confirm("Delete this food entry?")) {
    state.entries = state.entries.filter(x=>x.id!==del.dataset.delete);
    save();
    renderAll();
  }
});

// Start the app.
renderFoodChoices();
renderAll();
showView("dashboard");