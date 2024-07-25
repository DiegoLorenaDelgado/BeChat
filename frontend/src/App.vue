<template>
  <div class="chat-container">
    <div class="user-settings">
      <input v-model="userName" @keyup.enter="setUserName" placeholder="Enter your name" />
    </div>
    <div class="keyword-settings">
      <input v-model="newKeyword" @keyup.enter="addKeyword" placeholder="Add a keyword" />
      <button @click="updateKeywords">Update Keywords</button>
      <div>Current Keywords: {{ keywords.join(', ') }}</div>
    </div>
    <div class="users-list">
      <h3>Users Connected:</h3>
      <ul>
        <li v-for="(name, id) in users" :key="id">
          {{ name }}
        </li>
      </ul>
    </div>
    <div class="messages">
      <div v-for="(message, index) in messages" :key="index">
        <strong>{{ message.user }}:</strong> 
        <!-- Use v-html to render HTML content -->
        <span v-html="message.text"></span>
      </div>
    </div>
    <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');
const messages = ref<{ user: string; text: string }[]>([]);
const newMessage = ref<string>('');
const users = ref<Map<string, string>>(new Map());
const userName = ref<string>('');
const newKeyword = ref<string>('');
const keywords = ref<string[]>([]);

onMounted(() => {
  socket.on('message', (message: { user: string; text: string }) => {
    messages.value.push(message);
  });

  socket.on('updateUserList', (userList: [string, string][]) => {
    users.value = new Map(userList);
  });

  socket.on('updateKeywords', (updatedKeywords: string[]) => {
    keywords.value = updatedKeywords;
  });
});

const sendMessage = () => {
  if (newMessage.value.trim() !== '') {
    socket.emit('message', newMessage.value);
    newMessage.value = '';
  }
};

const setUserName = () => {
  if (userName.value.trim() !== '') {
    socket.emit('setName', userName.value);
  }
};

const addKeyword = () => {
  if (newKeyword.value.trim() !== '') {
    keywords.value.push(newKeyword.value.trim());
    newKeyword.value = '';
  }
};

const updateKeywords = () => {
  if (keywords.value.length > 0) {
    fetch('http://localhost:3000/set-keywords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ keywords: keywords.value })
    }).then(response => {
      if (response.ok) {
        console.log('Keywords updated');
      }
    });
  }
};
</script>

<style>
.chat-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.user-settings {
  margin-bottom: 10px;
}
.keyword-settings {
  margin-bottom: 10px;
}
.users-list {
  margin-bottom: 20px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}
.messages {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}
input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}
mark {
  background-color: yellow;
}
</style>
