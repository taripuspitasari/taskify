// variabel array yang menampung beberapa object (object data2 todo user)
const todos = [];
// mendefinisikan custom event dengan nama 'render-todo' yakni event patokan dase ketika ada perubahan data pada variabel todos
const RENDER_EVENT = "render-todo";

const SAVED_EVENT = "saved-todo";
const STORAGE_KEY = "TODO_APPS";

// event listener yg akan dijalankan setelah elemen html dibuat
document.addEventListener("DOMContentLoaded", function () {
  // menyiapkan elemen form untuk menangani event submit
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (event) {
    // agar tidak memuat ulang secara otomatis
    event.preventDefault();
    addTodo();
    const inputs = submitForm.querySelectorAll("input");
    inputs.forEach(input => (input.value = ""));
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

const completedButton = document.querySelector(".todoCompleted");
const todosButton = document.querySelector(".todoAll");
const completedTodoList = document.getElementById("completed-todos");
const todosTodoList = document.getElementById("todos");

completedButton.addEventListener("click", function () {
  completedTodoList.style.display = "block";
  todosTodoList.style.display = "none";
  completedButton.classList.add("active");
  todosButton.classList.remove("active");
});

todosButton.addEventListener("click", function () {
  todosTodoList.style.display = "block";
  completedTodoList.style.display = "none";
  todosButton.classList.add("active");
  completedButton.classList.remove("active");
});

function addTodo() {
  // memanggil properti value untuk mendapatkan nilai yg diinput oleh user
  const textTodo = document.getElementById("title").value;
  const timestamp = document.getElementById("date").value;

  const generatedID = generateId();
  //   generateTodoObject = helper pembuat objek baru
  const todoObject = generateTodoObject(
    generatedID,
    textTodo,
    timestamp,
    false
  );

  //   objek disimpan dalam array 'todos' dengan metode push()
  todos.push(todoObject);

  // RENDER_EVENT diterapkan untuk merender data yang telah disimpan pada array todos
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// fungsi yg menghasilkan identitas unik pada setiap item todo
function generateId() {
  return +new Date();
}

// fungsi membuat objek baru dari inputan user
function generateTodoObject(id, task, timestamp, isCompleted) {
  return {
    id,
    task,
    timestamp,
    isCompleted,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  // ambil container todo dari DOM
  const uncompletedTODOList = document.getElementById("todos");
  uncompletedTODOList.innerHTML = "";

  const completedTODOList = document.getElementById("completed-todos");
  //   agar tidak terjadi duplikasi dengan "" untuk menghapus elemen sebelumnya
  completedTODOList.innerHTML = "";

  let hasUncompleted = false;
  let hasCompleted = false;

  //   iterasi variabel todo untuk mengambil beberapa data todo yg telah tersimpan
  for (const todoItem of todos) {
    const todoElement = makeTodo(todoItem);
    // untuk memfilter hanya todo "yang harus dilakukan" saja yang perlu ditampilkan
    if (!todoItem.isCompleted) {
      uncompletedTODOList.append(todoElement);
      hasUncompleted = true;
    } else {
      // statement untuk menambahkan todo element ke completedTodolist
      completedTODOList.append(todoElement);
      hasCompleted = true;
    }
  }

  if (!hasUncompleted) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "No task found!";
    emptyMessage.classList.add("empty");
    uncompletedTODOList.append(emptyMessage);
  }

  if (!hasCompleted) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "No task found!";
    emptyMessage.classList.add("empty");
    completedTODOList.append(emptyMessage);
  }
});

function makeTodo(todoObject) {
  // createElement membuat objek DOM
  const textTitle = document.createElement("h4");
  //   properti untuk menyematkan konten berupa teks
  textTitle.innerText = todoObject.task;

  const textTimestamp = document.createElement("p");
  textTimestamp.innerText = todoObject.timestamp;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textTimestamp);

  const container = document.createElement("div");
  //   menambahkan satu atau beberapa class
  container.classList.add("item");
  container.append(textContainer);
  //   memberikan id unik pada setiap elemen todo tersebut
  container.setAttribute("id", `todo-${todoObject.id}`);

  if (todoObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");

    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(todoObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", function () {
      removeTaskFromCompleted(todoObject.id);
    });

    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");
    // menerapkan event listener, dengan fungsi memanggil fungsi sesuai konteks dari setiap tombol
    checkButton.addEventListener("click", function () {
      addTaskCompleted(todoObject.id);
    });

    container.append(checkButton);
  }

  // return statement agar elemen yg telah dibuat bisa digunakan
  return container;
}

function addTaskCompleted(todoId) {
  const todoTarget = findTodo(todoId);
  if (todoTarget == null) return;

  todoTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// fungsi mencari todo dengan ID yang sesuai pada array todos
function findTodo(todoId) {
  for (const todoItem of todos) {
    if (todoItem.id === todoId) {
      return todoItem;
    }
  }
  return null;
}

// menghapus todo
function removeTaskFromCompleted(todoId) {
  const todoTarget = findTodoIndex(todoId);

  if (todoTarget === -1) return;
  // splice(start, deleteCount)
  todos.splice(todoTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// mengubah todo completed menjadi incomplete
function undoTaskFromCompleted(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findTodoIndex(todoId) {
  for (const index in todos) {
    if (todos[index].id === todoId) {
      return index;
    }
  }
  return -1;
}

function saveData() {
  // isStorageExixt => fungsi pembantu yang mengembalikan nilai boolean
  if (isStorageExist()) {
    // konversi data object ke string
    const parsed = JSON.stringify(todos);
    // menyimpan data ke storage sesuai key yang kita tentukan
    localStorage.setItem(STORAGE_KEY, parsed);
    // saved_event => custom event untuk mempermudah tracking perubahan data
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

// saved_event untuk mempermudah dalam mengetahui bahwa pada setiap perubahan data bisa secara sukses memperbarui data pada storage
document.addEventListener(SAVED_EVENT, function () {
  // memanggil data dari local storage dan menampilkannya di console.log
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  // mengambil data dari localStorage (JSON)
  const serializedData = localStorage.getItem(STORAGE_KEY);
  // parse data JSON menjadi object
  let data = JSON.parse(serializedData);
  // masukkan satu persatu data dari object ke array todos
  if (data !== null) {
    for (const todo of data) {
      todos.push(todo);
    }
  }
  // memperbarui pada tampilan web
  document.dispatchEvent(new Event(RENDER_EVENT));
}
