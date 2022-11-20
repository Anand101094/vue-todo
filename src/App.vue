<template>
  <div id="app">
    <div class="app__wrapper w-1/2 p-2 border border-solid rounded-lg border-slate-300 relative">
      <div class=" flex relative">
        <input type="text" v-model="searchText" placeholder="Search Todos..."
          class="border rounded-sm border-slate-300 p-2 w-full mb-8" />

        <button @click="openModal(currentTodo)"
          class="font-bold text-l px-5 py-2 bg-sky-300 rounded-sm absolute right-0 border border-sky-300"> + Create
          Todos</button>
      </div>

      <div class="max-h-[460px] overflow-auto">
        <div v-for="todo in searchedResults" :key="todo.id" class="flex justify-between mb-2 rounded-sm p-px relative"
          :class="todo.reminderTimeInProgress ? 'bg-red-200' : 'bg-sky-200'">
          <div class="w-2/3 p-2 truncate" :class="todo.completed ? 'line-through	' : ''">{{ todo.title
          }}</div>
          <div class="todo__options p-2 flex items-center">

            <img v-if="todo.dueDate && !todo.reminderTimeInProgress" class="block w-4 h-4" src="./assets/clock.png"
              alt="clock" />
            <img v-if="todo.dueDate && todo.reminderTimeInProgress && !todo.alarmSnoozed"
              class="block w-4 h-4 cursor-pointer" src="./assets/clock-ringing.gif" alt="clock-ringing"
              @click="snoozeAlarm(todo.id)" />
            <audio v-if="todo.dueDate && todo.reminderTimeInProgress && !todo.alarmSnoozed"
              src="./assets/mixkit-scanning-sci-fi-alarm-905.wav" autoplay loop></audio>

            <img @click="removeTodo(todo.id)" class="block w-4 h-4 ml-4 cursor-pointer" src="./assets/trash3.svg" />
            <img @click="openModal(todo)" class="block w-4 h-4 ml-4 cursor-pointer" src="./assets/pencil.svg" />
            <img @click="toggleCompleted(todo.id)" class="block w-4 h-4 ml-4 mr-2 cursor-pointer"
              src="./assets/check-square.svg" />
          </div>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 border-t border-slate-300 flex border-sky-200">
        <button @click="selectedTab = 'all'" class="w-1/3 text-center border-r py-2"
          :class="selectedTab === 'all' ? 'bg-sky-300' : ''">All</button>
        <button @click="selectedTab = 'pending'" class="w-1/3 text-center border-r py-2"
          :class="selectedTab === 'pending' ? 'bg-sky-300' : ''">Pending</button>
        <button @click="selectedTab = 'completed'" class="w-1/3 text-center py-2"
          :class="selectedTab === 'completed' ? 'bg-sky-300' : ''">Completed</button>
      </div>

      <div v-if="!todoList.length" class=" text-lg w-48 text-center m-auto mt-24">
        Nothing create yet. Click on Create Todos to get started on your list.
      </div>

      <div v-if="todoList.length && !searchedResults.length" class=" text-lg w-48 text-center m-auto mt-24">
        No valid results found...
      </div>
    </div>

    <div class="cmp-t-modal" :class="todoModalOpen ? '' : 'hidden'">
      <div class="cmp-t-modal__overlay flex fixed inset-0 p-4 overflow-auto bg-black/30 backdrop-blur-[1px]">
        <div class="cmp-t-modal__content bg-white rounded-md m-auto px-12 py-8 shadow-lg w-1/2 max-w-lg">
          <form class="flex flex-col">
            <label for="todo-title" class="font-bold text-sm mb-0.5">Title <sup class="text-red-600">*</sup></label>
            <input type="text" v-model="currentTodo.title" class="border rounded-sm border-slate-300 p-2 w-full mb-6"
              name="todo-title" placeholder="What's on your mind..." />

            <label for="todo-desc" class="font-bold text-sm mb-0.5">Description</label>
            <textarea type="text" v-model="currentTodo.desc"
              class="border rounded-sm border-slate-300 p-2 w-full mb-8 h-40 max-h-40" name="todo-desc"
              placeholder="Add Description..."></textarea>

            <label for="todo-date-picker" class="font-bold text-sm mb-0.5">Due Date</label>
            <input type="datetime-local" class="border rounded-sm border-slate-300 p-2 w-full mb-6"
              name="todo-date-picker" v-model="currentTodo.dueDate" />

            <label for="todo-reminder-interval" class="font-bold text-sm mb-0.5">Reminder Interval</label>
            <select v-model="currentTodo.reminderTimestamp" class="border rounded-sm border-slate-300 p-2 w-full mb-6">
              <option disabled value="">Please select one</option>
              <option value="300000">5 minutes</option>
              <option value="600000">10 minutes</option>
              <option value="900000">15 minutes</option>
              <option value="1800000">30 minutes</option>
              <option value="2700000">45 minutes</option>
              <option value="3600000">1 hour</option>
            </select>
            <button @click.prevent="addAndUpdateTodo(currentTodo)"
              class="font-bold text-l px-5 py-3 bg-sky-300 rounded-sm mb-2">{{ editMode ? 'Update Todo' : ' Add Todo'
              }}</button>
            <button @click.prevent="resetToInitialState"
              class="font-bold text-l px-5 py-3 bg-sky-300 rounded-sm">Cancel</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { cloneDeep, generateUID } from "./utils/index"

export default {
  name: 'App',
  data() {
    return {
      currentTodo: {
        id: null,
        title: '',
        desc: '',
        dueDate: '',
        reminderTimestamp: '',
        reminderTimeInProgress: false,
        alarmSnoozed: false,
        completed: false,
      },
      editMode: false,
      todoList: [],
      todoModalOpen: false,
      searchText: '',
      selectedTab: 'all'
    }
  },

  computed: {
    searchedResults: function () {
      return this.displayResults.filter(todo => todo.title.toLowerCase().includes(this.searchText.toLowerCase()))
    },

    displayResults: function () {
      let results = cloneDeep(this.todoList);

      switch (this.selectedTab) {
        case 'pending':
          results = results.filter((todo) => !todo.completed);
          break;
        case 'completed':
          results = results.filter((todo) => todo.completed);
          break;
        default:
          break;
      }

      return results;
    }
  },

  methods: {
    checkReminders: function () {
      this.todoList.forEach(todo => {
        const { dueDate, reminderTimestamp } = todo;
        if (dueDate) {
          const dueDateTimestamp = new Date(dueDate).getTime();
          const snoozeTime = dueDateTimestamp - Number(reminderTimestamp);

          if (Date.now() >= snoozeTime) {
            todo.reminderTimeInProgress = true
          }
        }
      })
    },

    addAndUpdateTodo: function (todo) {
      // Add todo
      if (todo.id === null) {
        if (!todo.title) return;

        const newTodo = {
          id: generateUID(),
          title: this.currentTodo.title,
          desc: this.currentTodo.desc,
          completed: false,
          dueDate: this.currentTodo.dueDate,
          reminderTimestamp: this.currentTodo.reminderTimestamp,
          reminderTimeInProgress: this.currentTodo.reminderTimeInProgress,
          alarmSnoozed: this.currentTodo.alarmSnoozed,
        }
        this.todoList.push(newTodo);
        this.checkReminders();
        this.resetToInitialState();
      } else {
        // Update todo
        this.todoList = this.todoList.map(item => {
          if (item.id === todo.id) return todo;
          return item;
        })
        this.checkReminders();
        this.resetToInitialState();
      }
    },

    removeTodo: function (id) {
      const filteredTodos = this.todoList.filter(todo => todo.id !== id);
      this.todoList = filteredTodos;
    },

    snoozeAlarm: function (id) {
      this.todoList = this.todoList.map(todo => {
        if (todo.id === id) {
          todo.alarmSnoozed = true;
        }
        return todo;
      });
    },

    openModal: function (todo) {
      this.currentTodo = { ...todo };
      if (todo.id) {
        this.editMode = true;
      }
      this.todoModalOpen = true;
    },

    toggleCompleted: function (id) {
      this.todoList = this.todoList.map(todo => {
        if (todo.id === id) {
          todo.completed = !todo.completed;
        }
        return todo;
      });
    },

    resetToInitialState: function () {
      this.currentTodo = {
        id: null,
        title: '',
        desc: '',
        dueDate: '',
        reminderTimestamp: '',
        reminderTimeInProgress: false,
        alarmSnoozed: false,
        completed: false,
      }
      this.editMode = false;
      this.todoModalOpen = false;
    },

    updateLocalStorage: function (data) {
      localStorage.setItem('todoItems', JSON.stringify(data));
    }
  },

  watch: {
    todoList: function (newVal) {
      this.updateLocalStorage(newVal);
    }
  },

  mounted: function () {
    const todoItems = JSON.parse(localStorage.getItem('todoItems'));
    if (todoItems && todoItems.length) {
      this.todoList = todoItems;
    }

    setInterval(this.checkReminders, 15000);
  }
}
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  word-break: break-word;
}

.app__wrapper {
  height: 600px;
  max-height: 80vh;
}
</style>
